import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { buildSync } from "esbuild";
import { scanText, validateFiles } from "./localScanner.js";

test("scanner detects patterns without returning source lines or secret values", () => {
  const text = 'const password = "this-is-a-private-value";\neval(input);\nnode.innerHTML = value;\n-----BEGIN PRIVATE KEY-----';
  const result = scanText(text, "code.js");
  assert.deepEqual(result.findings.map(item => item.rule), ["embedded-secret", "dynamic-eval", "unsafe-html", "private-key"]);
  assert.equal(result.findings[1].line, 2);
  assert.equal(result.findings[0].file, "code.js");
  assert.ok(!JSON.stringify(result).includes("this-is-a-private-value"));
});
test("safe text has no findings; binary and oversized selections are rejected", () => {
  assert.deepEqual(scanText('const greeting = "hello";', "safe.js"), { findings: [], truncated: false });
  assert.throws(() => scanText("a\0b", "binary.txt"), /binário/);
  assert.throws(() => validateFiles([]), /Selecione/);
  assert.throws(() => validateFiles([{ name: "code.zip", size: 10 }]), /não suportado/);
  assert.throws(() => validateFiles([{ name: "code.py", size: 3 * 1024 * 1024 }]), /excede/);
  assert.throws(() => validateFiles(Array(51).fill({ name: "code.js", size: 1 })), /50 arquivos/);
  validateFiles([{ name: ".env", size: 10 }, { name: "code.ts", size: 10 }]);
});
test("scanner caps findings and marks incomplete results", () => {
  const result = scanText("eval(input);\n".repeat(600), "code.js");
  assert.equal(result.findings.length, 500);
  assert.equal(result.truncated, true);
});
test("local worker analyzes selected file without network or browser persistence", async () => {
  const { outputFiles } = buildSync({ entryPoints: [new URL("../pages/LocalAnalyses/scanner.worker.js", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")], bundle: true, write: false, format: "iife" });
  let posted;
  const self = { postMessage: value => { posted = value; } };
  const forbidden = () => assert.fail("Local analysis must not use network or persistence");
  const context = { self, fetch: forbidden, XMLHttpRequest: forbidden, indexedDB: { open: forbidden }, localStorage: { setItem: forbidden }, sessionStorage: { setItem: forbidden } };
  vm.runInNewContext(outputFiles[0].text, context);
  await self.onmessage({ data: [{ name: "local.py", size: 12, text: async () => "eval(input)" }] });
  assert.equal(posted.results[0].findings[0].rule, "dynamic-eval");
  assert.equal(posted.error, undefined);
  const workerSource = readFileSync(new URL("../pages/LocalAnalyses/scanner.worker.js", import.meta.url), "utf8");
  assert.doesNotMatch(workerSource, /api\.|firebase|localStorage|sessionStorage/);
});
