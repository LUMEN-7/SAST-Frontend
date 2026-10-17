import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { transformSync } from "esbuild";
import * as jsx from "react/jsx-runtime";

// Run component event handlers and effects against deterministic API responses.
function mount(path, api, props = {}) {
  const states = [], effects = [], refs = [];
  let cursor = 0, queued = [], tree;
  const hooks = {
    useState(initial) { const i = cursor++; if (!(i in states)) states[i] = typeof initial === "function" ? initial() : initial; return [states[i], value => { states[i] = typeof value === "function" ? value(states[i]) : value; }]; },
    useRef() { const i = cursor++; return refs[i] ||= { current: { showModal() {}, close() {} } }; },
    useEffect(callback, deps) { const i = cursor++; if (!effects[i] || deps.some((value, n) => value !== effects[i].deps[n])) { effects[i]?.cleanup?.(); effects[i] = { deps }; queued.push(() => { effects[i].cleanup = callback(); }); } },
  };
  const { code } = transformSync(fs.readFileSync(new URL(path, import.meta.url), "utf8"), { loader: "jsx", format: "cjs", jsx: "automatic" });
  const module = { exports: {} };
  const require = name => {
    if (name === "react") return hooks;
    if (name === "react/jsx-runtime") return jsx;
    if (name.endsWith("/api")) return { api };
    if (name.endsWith("/security")) return { severity: () => ({ label: "Alta" }) };
    if (name === "react-router-dom") return { Link: "a" };
    if (name === "lucide-react") return new Proxy({}, { get: (_, key) => key });
    return { default: name.includes("AddRepository") ? "AddRepository" : "stub", __esModule: true };
  };
  new Function("require", "module", "exports", code)(require, module, module.exports);
  function render() { cursor = 0; tree = module.exports.default(props); const pending = queued; queued = []; pending.forEach(effect => effect()); return tree; }
  return { render, async settle() { await new Promise(resolve => setImmediate(resolve)); return render(); }, unmount() { effects.forEach(effect => effect?.cleanup?.()); } };
}
function nodes(node) {
  if (!node || typeof node !== "object") return [];
  if (Array.isArray(node)) return node.flatMap(nodes);
  return [node, ...nodes(node.props?.children)];
}
function text(node) { if (Array.isArray(node)) return node.map(text).join(""); if (typeof node === "string" || typeof node === "number") return String(node); return text(node?.props?.children || ""); }
const button = (tree, label) => nodes(tree).find(node => node.type === "button" && text(node) === label);

test("page opens with monitored GET only; Add mounts picker and successful connection refreshes monitored GET", async () => {
  let gets = 0;
  const screen = mount("../../pages/Repositories/Repositories.jsx", { repos: async () => { gets++; return { repos: [] }; } });
  screen.render(); let tree = await screen.settle();
  assert.equal(gets, 1); assert.match(text(tree), /Nenhum repositório conectado/);
  assert.ok(!nodes(tree).some(node => node.type === "AddRepository"));
  button(tree, " Adicionar").props.onClick(); tree = screen.render();
  const picker = nodes(tree).find(node => node.type === "AddRepository"); assert.ok(picker);
  picker.props.onConnected(); screen.render(); tree = await screen.settle();
  assert.equal(gets, 2); assert.ok(!nodes(tree).some(node => node.type === "AddRepository")); screen.unmount();
});
test("picker requests one page at a time and disables connected repositories", async () => {
  const calls = [], posted = []; let refreshed = 0;
  const item = { github_id: 4, full_name: "owner/project", owner: "owner", html_url: "https://github.com/owner/project" };
  const screen = mount("./AddRepository.jsx", {
    availableRepos: async page => { calls.push(page); return { repos: [item, { ...item, github_id: 5, connected: true }], has_next: page === 1 }; },
    connectRepo: async repo => { posted.push(repo); },
  }, { onClose() {}, onConnected() { refreshed++; } });
  screen.render(); let tree = await screen.settle();
  assert.deepEqual(calls, [1]); assert.equal(button(tree, "Já conectado").props.disabled, true);
  assert.equal(button(tree, " Anterior"), undefined);
  button(tree, "Próxima ").props.onClick(); screen.render(); tree = await screen.settle();
  assert.deepEqual(calls, [1, 2]); assert.equal(button(tree, "Próxima "), undefined);
  button(tree, " Anterior").props.onClick(); screen.render(); tree = await screen.settle();
  assert.deepEqual(calls, [1, 2, 1]);
  await button(tree, " Conectar").props.onClick();
  assert.deepEqual(posted, [item]); assert.equal(refreshed, 1); screen.unmount();
});
test("401 shows GitHub login instead of repository rows and pagination", async () => {
  const screen = mount("./AddRepository.jsx", { availableRepos: async () => { throw { status: 401 }; }, githubUrl: () => "/api/v1/auth/github" }, { onClose() {} });
  screen.render(); const tree = await screen.settle();
  const login = nodes(tree).find(node => node.type === "a");
  assert.equal(login.props.href, "/api/v1/auth/github"); assert.match(text(login), /Entrar com GitHub/);
  assert.equal(button(tree, " Conectar"), undefined); assert.equal(button(tree, "Próxima "), undefined); screen.unmount();
});
