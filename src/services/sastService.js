import * as demo from "../mocks/sastData";
import { repositoryHistory } from "../mocks/repositoryHistory";
import { api, readRecent } from "../api";

export const isDemo = import.meta.env.VITE_DATA_MODE !== "api";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
    id: repo.id,
    name: (repo.full_name || "").split("/").pop(),
    full_name: repo.full_name,
    owner: repo.owner,
    branch: "main",
    language: repo.has_workflow ? "com workflow" : "",
    html_url: repo.html_url,
    has_workflow: repo.has_workflow,
    risk: riskFromCounts(counts.critical, counts.high, counts.medium),
    findings: findings.length,
    private: false,
  };
}

export const sastService = {
  async getRepositories() {
    if (isDemo) {
      await delay(100);
      return demo.repositories;
    }
    const data = await api.repos();
    const repos = data.repos || [];
    const withFindings = await Promise.all(
      repos.map(async (repo) =>
        mapRepo(repo, await api.repoFindings(repo.id).catch(() => [])),
      ),
    );
    return withFindings;
  },

  async getAnalyses() {
    if (isDemo) {
      await delay(100);
      return demo.analyses;
    }
    return readRecent().map((item) => ({
      id: item.id,
      repository_id: item.repository_id,
      repo_name: item.name,
      status: item.status,
      created_at: item.at,
      resultado: item.resultado,
      resolved: item.resolved,
    }));
  },

  async getAnalysisHistory() {
    if (isDemo) {
      await delay(100);
      return [...demo.analyses, ...repositoryHistory];
    }
    return this.getAnalyses();
  },

  async getAlerts() {
    if (isDemo) {
      await delay(100);
      return demo.alerts;
    }
    const repos = await this.getRepositories();
    const alerts = [];
    for (const repo of repos) {
      const findings = await api.repoFindings(repo.id).catch(() => []);
      findings
        .filter(
          (item) => item.severity === "critical" || item.severity === "high",
        )
        .forEach((item) => {
          alerts.push({
            id: item.id || `${repo.id}-${item.file_path}-${item.line}`,
            repository_id: repo.id,
            repository: repo.name,
            severity: item.severity,
            title: item.rule_id || "Achado",
            description: item.message || "",
            file: item.file_path,
            created_at: new Date().toISOString(),
            read: false,
            resultado: item.resultado,
          });
        });
    }
    return alerts;
  },

  async getRepositoryOverview(id) {
    const [repos, jobs, alerts] = await Promise.all([
      this.getRepositories(),
      this.getAnalyses(),
      this.getAlerts(),
    ]);
    const repo = repos.find((item) => String(item.id) === String(id)) || null;
    const summary = isDemo ? null : await api.summary(id, 30).catch(() => null);
    const analyses = isDemo
      ? repositoryHistory.filter((item) => item.repository_id === id)
      : jobs.filter((item) => item.repository_id === id);
    return {
      repo,
      analyses,
      alerts: alerts.filter((item) => item.repository_id === id),
      summary,
    };
  },

  async getSummary(repositoryId) {
    if (isDemo) return demo.summary;
    return api.summary(repositoryId);
  },

  async getAnalysis(id) {
    if (isDemo && String(id).startsWith("demo-")) {
      const row = [...demo.analyses, ...repositoryHistory].find(
        (item) => item.id === id,
      );
      if (!row) throw new Error("Análise não encontrada");
      const findings = demo.demoFindings.slice(
        0,
        Math.min(row.total_findings, 3),
      );
      return {
        status: {
          job_id: id,
          status: "completed",
          created_at: row.created_at,
          finished_at: row.created_at,
        },
        result: {
          job_id: id,
          status: "completed",
          total_findings: row.total_findings,
          severity_summary: {
            critical: row.critical,
            high: row.high,
            medium: row.medium,
            low: row.low,
          },
          findings,
        },
        gate: {
          gate: row.critical + row.high > 0 ? "fail" : "pass",
          blocking_findings: row.critical + row.high,
          threshold: "high",
        },
      };
    }
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
