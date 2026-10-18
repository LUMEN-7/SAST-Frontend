const count = value => {
  if (!["number", "string"].includes(typeof value) || (typeof value === "string" && !value.trim())) return undefined;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : undefined;
};
const commitValue = value => typeof value === "string" ? value : value?.sha || value?.id;

export function normalizeAnalysis(row, detail = {}, gate) {
  const result = { ...row.result, ...detail };
  const summary = result.severity_summary || result.severity_distribution || row.severity_summary || row.severity_distribution || {};
  const hasSummary = [result.severity_summary, result.severity_distribution, row.severity_summary, row.severity_distribution].some(value => value !== null && typeof value === "object" && !Array.isArray(value));
  const severityCount = key => count(summary[key]) ?? (hasSummary && !(key in summary) ? 0 : count(result[key]) ?? count(row[key]));
  return {
    ...row,
    id: row.id || row.job_id || result.job_id,
    status: String(result.status || row.status || "").toLowerCase(),
    commit: commitValue(result.commit) || result.commit_sha || result.sha || commitValue(row.commit) || row.commit_sha || row.sha || row.metadata?.commit_sha,
    branch: result.branch || row.branch,
    total_findings: count(result.total_findings) ?? count(row.total_findings) ?? (Array.isArray(result.findings) ? result.findings.length : undefined),
    critical: severityCount("critical"),
    high: severityCount("high"),
    medium: severityCount("medium"),
    low: severityCount("low"),
    gate: gate ?? result.gate ?? row.gate,
    security_gate: result.security_gate ?? row.security_gate,
    gate_result: result.gate_result ?? row.gate_result,
    security_result: result.security_result ?? row.security_result,
    resultado: result.resultado ?? row.resultado,
    created_at: row.created_at || result.created_at || row.at,
  };
}

function gateOutcome(analysis) {
  const candidates = [analysis?.gate?.gate, analysis?.gate, analysis?.security_gate?.gate, analysis?.security_gate, analysis?.gate_result, analysis?.security_result, analysis?.resultado];
  for (const raw of candidates) {
    const value = typeof raw === "string" ? raw.toLowerCase() : "";
    if (["pass", "approved", "aprovada", "aprovado"].includes(value)) return "approved";
    if (["fail", "rejected", "reprovada", "reprovado"].includes(value)) return "rejected";
  }
  return null;
}

export function getSecurityResult(analysis) {
  const row = analysis ? normalizeAnalysis(analysis) : null;
  if (!row || !["completed", "failed"].includes(row.status)) return "pending";
  if (row.status === "failed") return "unavailable";
  const outcome = gateOutcome(row);
  if (outcome) return outcome;
  if (row.critical !== undefined && row.high !== undefined) return row.critical + row.high > 0 ? "rejected" : "approved";
  return "unavailable";
}

export async function enrichAnalyses(rows, api) {
  const output = rows.map(row => normalizeAnalysis(row));
  let cursor = 0;
  // Limit concurrent rows; each row can request result and gate independently.
  async function worker() {
    while (cursor < output.length) {
      const index = cursor++;
      const row = output[index];
      if (row.status !== "completed" || !row.id) continue;
      const needsDetail = !row.commit || row.total_findings === undefined || ["critical", "high", "medium", "low"].some(key => row[key] === undefined);
      const needsGate = !gateOutcome(row);
      if (!needsDetail && !needsGate) continue;
      const [detail, gate] = await Promise.allSettled([
        needsDetail ? api.result(row.id) : Promise.resolve({}),
        needsGate ? api.gate(row.id, "high") : Promise.resolve(undefined),
      ]);
      output[index] = normalizeAnalysis(row, detail.status === "fulfilled" ? detail.value || {} : {}, gate.status === "fulfilled" ? gate.value : undefined);
      output[index].details_unavailable = detail.status === "rejected";
      output[index].gate_unavailable = gate.status === "rejected";
    }
  }
  await Promise.all(Array.from({ length: Math.min(4, output.length) }, worker));
  return output;
}
