import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { transformSync } from "esbuild";
import * as analysisData from "./analysisData.js";
function service(api, recent = []) {
  const { code } = transformSync(fs.readFileSync(new URL("./sastService.js", import.meta.url), "utf8"), { format: "cjs", define: { "import.meta.env.VITE_DATA_MODE": '"api"' } });
  const module = { exports: {} };
  new Function("require", "module", "exports", code)(name => name.endsWith("analysisData") ? analysisData : ({ api, readRecent: () => recent }), module, module.exports);
  return module.exports.sastService;
}
test("empty API data stays empty across repository, alerts and history views", async () => {
  const s = service({ repos: async () => ({ repos: [] }), findings: async () => [] });
  assert.deepEqual(await s.getRepositories(), []);
  assert.deepEqual(await s.getAlerts(), []);
  assert.deepEqual(await s.getAnalysisHistory(), []);
});
test("API failures propagate instead of returning demonstration data", async () => {
  const failure = async () => { throw new Error("API unavailable"); };
  const s = service({ repos: failure, findings: failure, summary: failure, status: failure, result: failure, gate: failure });
  await assert.rejects(s.getRepositories(), /API unavailable/);
  await assert.rejects(s.getAlerts(), /API unavailable/);
  await assert.rejects(s.getSummary(), /API unavailable/);
  await assert.rejects(s.getAnalysis("job-id"), /API unavailable/);
});
test("repository and alert metadata come from actual API responses", async () => {
  const s = service({
    repos: async () => ({ repos: [{ id: "repo-id", full_name: "owner/project", default_branch: "develop", private: true, language: "Python", findings: 1 }] }),
    findings: async () => [{ id: "finding-id", severity: "high", file_path: "app.py", message: "Finding" }],
  });
  const [repo] = await s.getRepositories();
  assert.equal(repo.branch, "develop");
  assert.equal(repo.language, "Python");
  assert.equal(repo.private, true);
  assert.equal(repo.findings, 1);
  const [alert] = await s.getAlerts();
  assert.equal(alert.id, "finding-id");
  assert.equal(alert.created_at, null);
});

test("new account with no backend records gets empty state instead of an error", async () => {
  const missing = async () => { const error = new Error("Not found"); error.status = 404; throw error; };
  const s = service({ repos: missing, summary: missing, findings: async () => [] });
  assert.deepEqual(await s.getRepositories(), []);
  assert.deepEqual(await s.getAlerts(), []);
  assert.equal(await s.getSummary(), null);
});
test("unauthorized requests are not mistaken for a new empty account", async () => {
  const denied = async () => { const error = new Error("Unauthorized"); error.status = 401; throw error; };
  const s = service({ repos: denied, summary: denied });
  await assert.rejects(s.getRepositories(), { status: 401 });
  await assert.rejects(s.getSummary(), { status: 401 });
});

test("repository settings retain configuration without requiring analysis results", async () => {
 const s=service({repos:async()=>({repos:[{id:"r",full_name:"org/repo",default_branch:"main",protection_state:"created",enforce_admins:true,hook_id:123}]})});
 const result=await s.getRepositoryOverview("r");
 assert.equal(result.repo.hook_id,123);assert.equal(result.repo.enforce_admins,true);assert.equal(result.repo.protection_state,"created");
 assert.deepEqual(result.analyses,[]);
});

test("analysis listing enriches completed backend jobs rather than losing their fields", async () => {
  const s=service({
    jobs:async()=>({jobs:[{job_id:"scan-id",repository_id:"r",status:"completed",commit_sha:"abc123"}]}),
    result:async()=>({total_findings:5,severity_summary:{critical:0,high:2,medium:3,low:0}}),
    gate:async()=>({gate:"fail"}),
  });
  const [row]=await s.getAnalyses();
  assert.equal(row.id,"scan-id"); assert.equal(row.commit,"abc123"); assert.equal(row.total_findings,5); assert.equal(row.high,2); assert.equal(row.gate.gate,"fail");
});
