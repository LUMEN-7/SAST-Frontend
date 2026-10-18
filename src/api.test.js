import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { transformSync } from "esbuild";
import { readApiError } from "./services/apiError.js";

function client(respond) {
  const calls = [];
  const source = fs.readFileSync(new URL("./api.js", import.meta.url),"utf8").replaceAll("import.meta.env.VITE_API_BASE_URL",'""');
  const { code } = transformSync(source,{format:"cjs"});
  const module = {exports:{}};
  const auth = { currentUser:{uid:"account-uid",getIdToken:async()=>"firebase-test-token"},authStateReady:async()=>{} };
  const storage = { getItem:()=>null };
  const fetchMock = async (url,options) => { calls.push({url,...options}); return respond(url,options); };
  new Function("require","module","exports","fetch","localStorage",code)(
    name => name==="./firebase" ? {auth} : {readApiError},module,module.exports,fetchMock,storage
  );
  return {api:module.exports.api,calls};
}
test("group operations send Firebase Bearer and contract payloads",async()=>{
  const {api,calls}=client(()=>new Response("{}",{status:200}));
  await api.groups();
  await api.createGroup("LUMEN");
  await api.addGroupRepo("group/id","repo/id");
  await api.addGroupMember("group/id","dev@lumen.test","admin");
  await api.groupSummary("group/id");
  assert.ok(calls.every(call=>call.headers.Authorization==="Bearer firebase-test-token"));
  assert.equal(calls[0].url,"/api/v1/groups");
  assert.equal(calls[1].method,"POST");
  assert.deepEqual(JSON.parse(calls[1].body),{name:"LUMEN"});
  assert.equal(calls[2].url,"/api/v1/groups/group%2Fid/repos/repo%2Fid");
  assert.equal(calls[2].method,"POST");
  assert.equal(calls[3].url,"/api/v1/groups/group%2Fid/members");
  assert.deepEqual(JSON.parse(calls[3].body),{email:"dev@lumen.test",role:"admin"});
  assert.equal(calls[4].url,"/api/v1/dashboard/summary?group_id=group%2Fid");
});
test("group associations accept empty success responses",async()=>{
  const {api}=client(()=>new Response(null,{status:204}));
  assert.equal(await api.addGroupRepo("g","r"),null);
  assert.equal(await api.addGroupMember("g","dev@lumen.test","member"),null);
});
test("group summary preserves backend 403 instead of returning empty metrics",async()=>{
  const {api}=client(()=>new Response('{"detail":"Admins only"}',{status:403}));
  await assert.rejects(api.groupSummary("g"),{status:403,message:"Admins only"});
});
