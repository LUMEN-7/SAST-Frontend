import { auth } from "./firebase";
import { readApiError } from "./services/apiError";
const BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "lumen-sast-token";

export function readToken() {
  const fromUrl = new URLSearchParams(window.location.search).get("sast_token");
  if (fromUrl) {
    localStorage.setItem(TOKEN_KEY, fromUrl);
    const url = new URL(window.location.href);
    url.searchParams.delete("sast_token");
    window.history.replaceState({}, "", url.pathname + url.search);
  }
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
    ...(!auth && token ? { Authorization: `Bearer ${token}` } : {}),
    ...(token ? { "X-Sast-Token": token } : {}),
    ...extra,
  };
}

export async function request(path, options = {}) {
  if (auth) await auth.authStateReady();
  const firebaseToken = await auth?.currentUser?.getIdToken();
  const response = await fetch(BASE + path, {
    ...options,
    headers: { ...headers(options.headers), ...(firebaseToken ? { Authorization: `Bearer ${firebaseToken}` } : {}) },
  });
  if (!response.ok) {
    throw await readApiError(response);
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
  groups: () => request("/api/v1/groups").then((r) => r.json()),
  createGroup: (name) =>
    request("/api/v1/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }).then((r) => r.json()),
  addGroupRepo: (groupId, repositoryId) =>
    request(`/api/v1/groups/${groupId}/repos/${repositoryId}`, { method: "POST" }).then((r) => r.json()),
  addGroupMember: (groupId, email, role) =>
    request(`/api/v1/groups/${groupId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    }).then((r) => r.json()),
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

function recentKey() {
  const uid = auth?.currentUser?.uid;
  return uid ? `${RECENT_KEY}-${uid}` : `${RECENT_KEY}-anon`;
}

export function readRecent() {
  try {
    const items = JSON.parse(localStorage.getItem(recentKey()) || "[]");
    if (!Array.isArray(items)) return [];
    // Discard entries left by the retired demonstration mode.
    const real = items.filter(item => typeof item?.id === "string" && !item.id.startsWith("demo-"));
    if (real.length !== items.length) localStorage.setItem(recentKey(), JSON.stringify(real));
    return real;
  } catch {
    return [];
  }
}

export function saveRecent(item) {
  const items = [
    { ...item, at: new Date().toISOString() },
    ...readRecent().filter((x) => x.id !== item.id),
  ].slice(0, 24);
  localStorage.setItem(recentKey(), JSON.stringify(items));
  return items;
}
