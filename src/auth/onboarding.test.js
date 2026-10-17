import {test} from "node:test";
import assert from "node:assert/strict";
import {needsOnboarding,onboardingKey} from "./onboarding.js";
const created = "2026-10-17T12:00:00.000Z";
const account = {uid:"user-a",metadata:{creationTime:created,lastSignInTime:created}};
test("first login offers onboarding; a returning login does not",()=>{
  assert.equal(needsOnboarding(account,{getItem:()=>null}),true);
  assert.equal(needsOnboarding({...account,metadata:{creationTime:created,lastSignInTime:"2026-10-18T12:00:00Z"}},{getItem:()=>null}),false);
});
test("completed or skipped onboarding is isolated by UID",()=>{
  const storage={getItem:key=>key===onboardingKey("user-a")?"1":null};
  assert.equal(needsOnboarding(account,storage),false);
  assert.equal(needsOnboarding({...account,uid:"user-b"},storage),true);
});
test("missing metadata does not trap existing accounts; blocked storage does not crash",()=>{
  assert.equal(needsOnboarding({uid:"existing"},null),false);
  assert.equal(needsOnboarding(null,null),false);
  assert.equal(needsOnboarding(account,{getItem:()=>{throw new Error("Storage blocked")}}),true);
});
