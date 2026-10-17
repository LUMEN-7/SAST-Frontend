import { api, readRecent } from "../api";


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
    const data = await api.repos().catch(error => {
      if (error.status === 404) return { repos: [] };
      throw error;
    });
    const repos = data.repos || [];
    const withFindings = await Promise.all(
      repos.map(async (repo) =>
        mapRepo(repo, await api.repoFindings(repo.id)),
      ),
    );
    return withFindings;
  },

  async getAnalyses() {
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
    return this.getAnalyses();
  },

  async getAlerts() {
    const repos = await this.getRepositories();
    const alerts = [];
    for (const repo of repos) {
      const findings = await api.repoFindings(repo.id);
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
            created_at: item.created_at || null,
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
    const summary = await api.summary(id, 30);
    const analyses = jobs.filter((item) => String(item.repository_id) === String(id));
    return {
      repo,
      analyses,
      alerts: alerts.filter((item) => item.repository_id === id),
      summary,
    };
  },

  async getSummary(repositoryId) {
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
