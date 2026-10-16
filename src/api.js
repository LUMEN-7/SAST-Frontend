const BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "lumen-sast-token";

export function readToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function saveToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function headers(extra = {}) {
  const token = readToken();
  return {
    "ngrok-skip-browser-warning": "true",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export async function request(path, options = {}) {
  const response = await fetch(BASE + path, {
    ...options,
    headers: headers(options.headers),
  });
  if (!response.ok) {
    let error = "";
    try {
      const body = await response.json();
      error =
        typeof body.detail === "string"
          ? body.detail
          : JSON.stringify(body.detail || body);
    } catch {
      error = await response.text();
    }
    throw new Error(error || "Não foi possível comunicar com a API.");
  }
  return response;
}

export const api = {
  summary: (repositoryId, days = 30) => {
    const params = new URLSearchParams({ days: String(days) });
    if (repositoryId) params.set("repository_id", repositoryId);
    return request(`/api/v1/dashboard/summary?${params}`).then((r) => r.json());
  },
  repos: () => request("/api/v1/repos").then((r) => r.json()),
  repoFindings: (id) =>
    request(`/api/v1/repos/${id}/findings`).then((r) => r.json()),
  submit: (file, repositoryId) => {
    const body = new FormData();
    body.append("file", file);
    if (repositoryId) body.append("repository_id", repositoryId);
    return request("/api/v1/analysis", { method: "POST", body }).then((r) =>
      r.json(),
    );
  },
  status: (id) =>
    request(`/api/v1/analysis/${id}/status`).then((r) => r.json()),
  result: (id) =>
    request(`/api/v1/analysis/${id}/result`).then((r) => r.json()),
  gate: (id, threshold = "high") =>
    request(
      `/api/v1/analysis/${id}/gate?threshold=${encodeURIComponent(threshold)}`,
    ).then((r) => r.json()),
  report: (id) =>
    request(`/api/v1/analysis/${id}/report`).then((r) => r.text()),
  anonymous: () =>
    request("/api/v1/auth/anonymous", { method: "POST" }).then((r) => r.json()),
  me: () => request("/api/v1/auth/me").then((r) => r.json()),
  resolve: (id, resolved) =>
    request(`/api/v1/analysis/${id}/resolvido`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolved }),
    }).then((r) => r.json()),
  githubUrl: () => `${BASE}/api/v1/auth/github`,
};

const RECENT_KEY = "lumen-sast-recent-v1";

export function readRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveRecent(item) {
  const items = [
    { ...item, at: new Date().toISOString() },
    ...readRecent().filter((x) => x.id !== item.id),
  ].slice(0, 24);
  localStorage.setItem(RECENT_KEY, JSON.stringify(items));
  return items;
}
