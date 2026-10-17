import { test } from "node:test";
import assert from "node:assert/strict";
import { completeAccountLink } from "./linkAccount.js";

test("links the pending provider to the authenticated UID with the same email", async () => {
  const user = { uid: "original", email: "Person@example.com" };
  const credential = { providerId: "github.com" };
  let linked = false;
  await completeAccountLink(user, { email: "person@example.com", credential }, {
    link: async (actualUser, actualCredential) => {
      assert.equal(actualUser, user); assert.equal(actualCredential, credential); linked = true;
    }, logout: () => assert.fail("Must keep the original session"),
  });
  assert.ok(linked);
});
test("rejects a different or missing email and signs out without linking", async () => {
  for (const email of ["other@example.com", null]) {
    let loggedOut = false;
    await assert.rejects(completeAccountLink({ email }, { email: "person@example.com", credential: {} }, {
      link: () => assert.fail("Must not link another account"), logout: async () => { loggedOut = true; },
    }), { code: "auth/link-email-mismatch" });
    assert.ok(loggedOut);
  }
});
test("keeps failures visible so linking can be retried", async () => {
  const pending = { email: "person@example.com", credential: {} };
  const failure = new Error("network");
  await assert.rejects(completeAccountLink({ email: pending.email }, pending, {
    link: async () => { throw failure; }, logout: () => assert.fail(),
  }), failure);
  assert.ok(pending.credential);
});

test("already linked provider completes without linking again", async () => {
  await completeAccountLink({ email: "person@example.com", providerData: [{ providerId: "github.com" }] },
    { email: "person@example.com", credential: { providerId: "github.com" } }, {
      link: () => assert.fail("Provider is already linked"), logout: () => assert.fail(),
    });
});
test("provider-already-linked from Firebase is an idempotent success", async () => {
  await completeAccountLink({ email: "person@example.com" },
    { email: "person@example.com", credential: { providerId: "github.com" } }, {
      link: async () => { throw { code: "auth/provider-already-linked" }; }, logout: () => assert.fail(),
    });
});
test("same provider on a different email still rejects linking", async () => {
  await assert.rejects(completeAccountLink({ email: "other@example.com", providerData: [{ providerId: "github.com" }] },
    { email: "person@example.com", credential: { providerId: "github.com" } }, {
      link: () => assert.fail(), logout: async () => {},
    }), { code: "auth/link-email-mismatch" });
});
