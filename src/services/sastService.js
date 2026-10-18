import { api, readRecent } from "../api";
import { normalizeAnalysis, enrichAnalyses } from "./analysisData";

export const isDemo = import.meta.env.VITE_DATA_MODE !== "api";


function riskFromCounts(critical = 0, high = 0, medium = 0) {
  if (critical) return "critical";
  if (high) return "high";
  if (medium) return "medium";
  return "low";
}

function mapRepo(repo, findings = []) {
  const counts = findings.reduce((acc, item) => {
    acc[item.severity] = (acc[item.severity] || 0) + 1;
    return acc;
  }, {});
  return {
    ...repo,
    id: repo.id,
    name: (repo.full_name || "").split("/").pop(),
    full_name: repo.full_name,
    owner: repo.owner,
    branch: repo.default_branch || repo.branch || null,
    language: repo.language || "",
    html_url: repo.html_url,
    has_workflow: repo.has_workflow,
    risk: riskFromCounts(counts.critical, counts.high, counts.medium),
    findings: findings.length,
    private: repo.private ?? null,
  };
}

export const sastService = {
  async getRepositories() {
    if (isDemo) return [];
    const data = await api.repos().catch(error => {
      if (error.status === 404) return { repos: [] };
      throw error;
    });
    const repos = data.repos || [];
    return repos.map(repo => ({ ...mapRepo(repo), risk: repo.risk || null, findings: repo.findings ?? 0 }));
  },

  async getAnalyses() {
    const local = readRecent().map((item) => normalizeAnalysis({
      ...item,
      id: item.id,
      repository_id: item.repository_id,
      repo_name: item.repo_name || item.name,
      status: item.status,
      created_at: item.created_at || item.at,
      resultado: item.resultado,
      resolved: item.resolved,
    }));
    let rows = local;
    try {
      const response = await api.jobs();
      const localById = new Map(local.map(item => [item.id, item]));
      const remote = (Array.isArray(response) ? response : response?.jobs || response?.analyses || response?.items || []).map(item => normalizeAnalysis({ ...localById.get(item.id || item.job_id), ...item }));
      const seen = new Set(remote.map(item => item.id));
      rows = [
        ...remote,
        ...local.filter((item) => !seen.has(item.id)),
      ];
    } catch { /* Keep the real local history if the listing is unavailable. */ }
    return enrichAnalyses(rows, api);
  },

  async getAnalysisHistory() {
    return this.getAnalyses();
  },

  async getAlerts() {
    if (isDemo) return [];
    const rows = await api.findings();
    return (Array.isArray(rows) ? rows : [])
      .filter((item) => item.severity === "critical" || item.severity === "high")
      .map((item) => ({
        id: item.id,
        repository_id: item.repository_id,
        repository: item.repository,
        severity: item.severity,
        title: item.rule_id || "Achado",
        description: item.message || "",
        file: item.file_path,
        created_at: item.created_at || null,
        read: false,
        resultado: item.resultado,
      }));
  },

  async getRepositoryOverview(id) {
    const [data, jobs] = await Promise.all([
      api.repos(),
      this.getAnalyses(),
    ]);
    const repos = Array.isArray(data) ? data : data.repos || [];
    const raw = repos.find(item => String(item.id) === String(id));
    const repo = raw ? { ...raw, branch: raw.default_branch || raw.branch, language: raw.language || "" } : null;
    const analyses = jobs.filter((item) => String(item.repository_id) === String(id));
    return {
      repo,
      analyses,
      alerts: [],
      summary: null,
    };
  },

  async getSummary(repositoryId) {
    if (isDemo) return null;
    return api.summary(repositoryId).catch(error => {
      if (error.status === 404) return null;
      throw error;
    });
  },

  async getAnalysis(id) {
    const [status, result, gate] = await Promise.all([
      api.status(id),
      api.result(id),
      api.gate(id),
    ]);
    return { status, result, gate };
  },

  async loginAnonymous() {
    const data = await api.anonymous();
    return data.token;
  },
};
