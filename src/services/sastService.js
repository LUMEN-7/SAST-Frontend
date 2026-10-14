import * as demo from "../mocks/sastData";
import {api,readRecent} from "../api";
// Em desenvolvimento usa mock por padrão. VITE_DATA_MODE=api desativa.
export const isDemo=import.meta.env.VITE_DATA_MODE!=="api";
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
export const sastService={
 async getRepositories(){if(isDemo){await delay(100);return demo.repositories;}return [];/* TODO: GET /api/v1/repositories */},
 async getAnalyses(){if(isDemo){await delay(100);return demo.analyses;}return readRecent().map(i=>({id:i.id,repo_name:i.name,status:i.status,created_at:i.at}));/* TODO: GET /api/v1/analyses */},
 async getAlerts(){if(isDemo){await delay(100);return demo.alerts;}return [];/* TODO: GET /api/v1/alerts */},
 async getSummary(){return isDemo?demo.summary:api.summary()},
 async getAnalysis(id){if(isDemo&&id.startsWith("demo-")){const row=demo.analyses.find(a=>a.id===id);if(!row)throw new Error("Análise não encontrada");const findings=demo.demoFindings.slice(0,Math.min(row.total_findings,3));return {status:{job_id:id,status:"completed",created_at:row.created_at,finished_at:row.created_at},result:{job_id:id,status:"completed",total_findings:row.total_findings,severity_summary:{critical:row.critical,high:row.high,medium:row.medium,low:row.low},findings},gate:{gate:row.critical+row.high>0?"fail":"pass",blocking_findings:row.critical+row.high,threshold:"high"}}}return {status:await api.status(id),result:await api.result(id),gate:await api.gate(id)}} 
};
