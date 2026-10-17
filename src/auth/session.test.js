import { test } from "node:test";
import assert from "node:assert/strict";
import { clearSessionCache, endSession } from "./session.js";

test("logout clears session and application caches before replacing the page", async () => {
  const events = [];
  await endSession({
    signOut: async () => events.push("signOut"),
    clear: () => clearSessionCache({
      localStorage: { clear: () => events.push("local") },
      sessionStorage: { clear: () => events.push("session") },
      caches: { keys: async () => ["results", "assets"], delete: async key => events.push(key) },
    }),
    redirect: () => events.push("redirect"),
  });
  assert.deepEqual(events, ["signOut", "local", "session", "results", "assets", "redirect"]);
});
test("logout does not erase data or redirect if Firebase sign-out fails", async () => {
  await assert.rejects(endSession({
    signOut: async () => { throw new Error("failed"); },
    clear: () => assert.fail(), redirect: () => assert.fail(),
  }), /failed/);
});
test("cache cleanup supports browsers without Cache Storage", async () => {
  let cleared = 0;
  await clearSessionCache({ localStorage: { clear: () => cleared++ }, sessionStorage: { clear: () => cleared++ } });
  assert.equal(cleared, 2);
});
