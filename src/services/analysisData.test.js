import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeAnalysis, enrichAnalyses, getSecurityResult } from "./analysisData.js";

test("completed history rows receive commit, findings and gate from detail endpoints", async () => {
 const calls=[];
 const [row]=await enrichAnalyses([{id:"scan",status:"completed",created_at:"2026-10-18T18:17:29Z"}],{
  result:async id=>{calls.push(["result",id]);return {job_id:id,commit_sha:"abcd1234",total_findings:4,severity_summary:{critical:1,high:2,medium:1,low:0}};},
  gate:async(id,threshold)=>{calls.push(["gate",id,threshold]);return {gate:"fail"};}
 });
 assert.equal(row.commit,"abcd1234");assert.equal(row.total_findings,4);assert.equal(row.critical,1);assert.equal(row.high,2);assert.equal(getSecurityResult(row),"rejected");
 assert.deepEqual(calls,[["result","scan"],["gate","scan","high"]]);
});
test("list response aliases, nested summary, resultado and zero values are preserved",()=>{
 const row=normalizeAnalysis({job_id:"scan",status:"completed",commit_sha:"deadbeef",result:{total_findings:0,severity_summary:{critical:"0",high:0,medium:0,low:0}},resultado:"aprovado"});
 assert.equal(row.id,"scan");assert.equal(row.total_findings,0);assert.equal(row.commit,"deadbeef");assert.equal(getSecurityResult(row),"approved");
 assert.equal(getSecurityResult({status:"completed",resultado:"reprovado"}),"rejected");
});
test("completed with missing data is not pending or falsely approved; in-progress remains pending",()=>{
 assert.equal(getSecurityResult({status:"completed",total_findings:0}),"unavailable");
 assert.equal(getSecurityResult({status:"completed",total_findings:8}),"unavailable");
 assert.equal(getSecurityResult({status:"running",gate:{gate:"pass"}}),"pending");
 assert.equal(getSecurityResult({status:"failed"}),"unavailable");
});
test("authoritative gate overrides severity counts",()=>{
 assert.equal(getSecurityResult({status:"completed",critical:3,high:0,gate:{gate:"pass"}}),"approved");
 assert.equal(getSecurityResult({status:"completed",severity_summary:{critical:0,high:2}}),"rejected");
});
test("a missing result endpoint does not discard working gate or break other rows",async()=>{
 const rows=await enrichAnalyses([{id:"missing",status:"completed"},{id:"good",status:"completed"},{id:"running",status:"running"}],{
  result:async id=>{if(id==="missing")throw new Error("not ready");return {total_findings:0};},
  gate:async id=>{assert.notEqual(id,"running");return {gate:"pass"};}
 });
 assert.equal(rows[0].details_unavailable,true);assert.equal(getSecurityResult(rows[0]),"approved");assert.equal(rows[1].total_findings,0);assert.equal(getSecurityResult(rows[2]),"pending");
});
test("fully populated rows require no additional requests",async()=>{
 const row={id:"scan",status:"completed",commit:"abc123",total_findings:0,critical:0,high:0,medium:0,low:0,gate:{gate:"pass"}};
 const [result]=await enrichAnalyses([row],{result:()=>assert.fail(),gate:()=>assert.fail()});
 assert.equal(result.total_findings,0);assert.equal(getSecurityResult(result),"approved");
});
test("detail requests have bounded concurrency",async()=>{
 let active=0,max=0;
 const rows=Array.from({length:10},(_,i)=>({id:String(i),status:"completed"}));
 await enrichAnalyses(rows,{
  result:async()=>{max=Math.max(max,++active);await new Promise(resolve=>setImmediate(resolve));active--;return {total_findings:0};},
  gate:async()=>({gate:"pass"})
 });
 assert.equal(max,4);
});

test("published AnalysisResultOut and GateOut schemas populate history without a commit field", async () => {
 const [row]=await enrichAnalyses([{id:"scan",status:"completed"}],{
  result:async()=>({job_id:"scan",status:"completed",total_findings:2,severity_summary:{high:2},findings:[]}),
  gate:async()=>({job_id:"scan",status:"completed",gate:"fail",threshold:"high",blocking_findings:2,reasons:[]})
 });
 assert.equal(row.total_findings,2);assert.equal(row.high,2);assert.equal(row.critical,0);assert.equal(getSecurityResult(row),"rejected");assert.equal(row.commit,undefined);
 const empty=normalizeAnalysis({status:"completed",total_findings:0,severity_summary:{}});
 assert.equal(getSecurityResult(empty),"approved");
});
