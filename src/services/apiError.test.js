import { test } from "node:test";
import assert from "node:assert/strict";
import { readApiError } from "./apiError.js";

test("plain text response preserves the backend error and status without reading twice", async () => {
  const response = new Response("Backend unavailable", { status: 503 });
  const error = await readApiError(response);
  assert.equal(error.message, "Backend unavailable");
  assert.equal(error.status, 503);
  assert.equal(response.bodyUsed, true);
});
test("JSON responses preserve API details", async () => {
  const error = await readApiError(new Response('{"detail":"Not found"}', { status: 404 }));
  assert.equal(error.message, "Not found");
  assert.equal(error.status, 404);
});
test("HTML and empty bodies get readable messages", async () => {
  const html = await readApiError(new Response("<!doctype html><title>Bad gateway</title>", { status: 502 }));
  assert.match(html.message, /resposta inesperada/);
  assert.equal(html.status, 502);
  const empty = await readApiError(new Response("", { status: 500 }));
  assert.match(empty.message, /HTTP 500/);
});
test("malformed JSON stays readable and structured validation errors are preserved", async () => {
  const malformed = await readApiError(new Response('{"detail":', { status: 500 }));
  assert.equal(malformed.message, '{"detail":');
  const validation = await readApiError(new Response('{"detail":[{"msg":"required"}]}', { status: 422 }));
  assert.match(validation.message, /required/);
});

test("structured backend configuration errors retain their code",async()=>{
 for(const body of [{code:"not_admin"},{detail:{code:"existing_protection"}}]){
  const error=await readApiError(new Response(JSON.stringify(body),{status:403}));
  assert.equal(error.code,body.code||body.detail.code);assert.deepEqual(error.details,body);
 }
});
