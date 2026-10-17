import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { transformSync } from "esbuild";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
const source = readFileSync(new URL("./LinkingStep.jsx", import.meta.url), "utf8");
const { code } = transformSync(source, { loader: "jsx", format: "cjs", jsx: "automatic" });
const module = { exports: {} };
new Function("require", "module", "exports", code)(createRequire(import.meta.url), module, module.exports);
const LinkingStep = module.exports.default;
function render(props = {}) {
  return renderToStaticMarkup(React.createElement(LinkingStep, { email: "person@example.com", ...props },
    React.createElement("form", null, React.createElement("input", { type: "password", required: true }))));
}
test("social confirmation has visible buttons and no password fields or form", () => {
  const html = render();
  assert.match(html, /Confirmar com Google/);
  assert.match(html, /Confirmar com GitHub/);
  assert.doesNotMatch(html, /<form|<input|<details/);
  assert.equal((html.match(/type="button"/g) || []).length, 4);
});
test("password fields are only mounted after explicitly choosing password", () => {
  assert.match(render({ passwordMode: true }), /type="password"/);
});
test("authenticated confirmation never requires a password", () => {
  const html = render({ authenticated: true, passwordMode: true });
  assert.match(html, /Concluir vinculação/);
  assert.doesNotMatch(html, /<form|<input/);
});

test("link confirmation masks the email without exposing it in markup", () => {
  const html = render();
  assert.match(html, /pe\*\*\*@example.com/);
  assert.doesNotMatch(html, /person@example.com/);
  const { maskEmail } = module.exports;
  assert.equal(maskEmail("a@example.com"), "a***@example.com");
  assert.equal(maskEmail("ab@example.com"), "a***@example.com");
  assert.equal(maskEmail(null), "***");
  assert.equal(maskEmail("invalid"), "***");
});
