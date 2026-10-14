import {useEffect,useMemo,useState} from "react";
import {Link,useParams} from "react-router-dom";
import {ArrowLeft,ArrowUpRight,GitBranch,FolderGit2,ShieldAlert,Activity,Clock3} from "lucide-react";
import {ResponsiveContainer,LineChart,Line,CartesianGrid,XAxis,YAxis,Tooltip} from "recharts";
import Layout from "../../components/layout/AppLayout";
import Status from "../../components/ui/AnalysisStatus";
import Tag from "../../components/ui/SeverityTag";
import {sastService,isDemo} from "../../services/sastService";
import {date} from "../../utils/security";
import "./RepositoryDetails.css";

export default function RepositoryDetails(){
 const {id}=useParams();
 const [data,setData]=useState({repo:null,analyses:[],alerts:[]}),[loading,setLoading]=useState(true),[error,setError]=useState("");
 useEffect(()=>{let active=true;setLoading(true);sastService.getRepositoryOverview(id).then(x=>{if(active){setData(x);setError("")}}).catch(e=>{if(active)setError(e.message)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[id]);
 const {repo,analyses}=data;
 const ordered=useMemo(()=>[...analyses].sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0)),[analyses]);
 const latest=ordered[0];
 const severityCounts=[{key:"critical",label:"Críticos",count:latest?.critical??0},{key:"high",label:"Altos",count:latest?.high??0},{key:"medium",label:"Médios",count:latest?.medium??0},{key:"low",label:"Baixos",count:latest?.low??0}];
 const hasSeverity=latest&&["critical","high","medium","low"].some(key=>typeof latest[key]==="number");
 const trend=ordered.slice().reverse().map(a=>({date:new Date(a.created_at).toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"}),findings:a.total_findings||0}));
 return <Layout><main className="container page repository-details">
  <Link to="/repositories" className="back-link"><ArrowLeft size={15}/> Voltar aos repositórios</Link>
  {loading?<div className="panel">Carregando repositório...</div>:error?<div className="notice error">{error}</div>:!repo?<div className="panel">Repositório não encontrado.</div>:<>
   <div className="page-heading"><div><h1>{repo.full_name}</h1><p><GitBranch size={14}/> {repo.branch} · {repo.language} · Histórico de segurança</p></div>{isDemo&&<span className="neutral-pill">DADOS DE DEMONSTRAÇÃO</span>}</div>
   <div className="repo-detail-stats"><div className="panel"><span><Activity size={16}/> Análises realizadas</span><strong>{ordered.length}</strong></div><div className="panel"><span><ShieldAlert size={16}/> Achados mais recentes</span><strong>{latest?.total_findings??"—"}</strong></div><div className="panel"><span><FolderGit2 size={16}/> Risco atual</span><Tag name={repo.risk}/></div><div className="panel"><span><Clock3 size={16}/> Última análise</span><b>{latest?date(latest.created_at):"Sem execuções"}</b></div></div>
   <div className="repo-detail-columns"><section className="panel"><div className="panel-head"><div><h2>Evolução dos achados</h2><p>Total registrado por análise</p></div></div>{trend.length>=2?<div className="repo-trend"><ResponsiveContainer width="100%" height="100%"><LineChart data={trend}><CartesianGrid stroke="#e9eef0" strokeDasharray="3 5"/><XAxis dataKey="date" tick={{fontSize:11}}/><YAxis allowDecimals={false} tick={{fontSize:11}}/><Tooltip/><Line dataKey="findings" name="Achados" stroke="#456777" strokeWidth={2} dot={{r:4}}/></LineChart></ResponsiveContainer></div>:<div className="repo-detail-empty">O gráfico será exibido quando houver ao menos duas análises deste repositório.</div>}</section>
   <section className="panel"><div className="panel-head"><div><h2>Panorama de segurança</h2><p>Distribuição de severidades na análise mais recente</p></div></div>
   {hasSeverity?<div className="repo-severity-overview">
    <div className="repo-severity-total"><strong>{latest.total_findings??0}</strong><span>achados identificados</span></div>
    <div className="repo-severity-bars">{severityCounts.map(item=><div className="repo-severity-row" key={item.key}>
      <div className="repo-severity-label"><Tag name={item.key}/><b>{item.count}</b></div>
      <div className="repo-severity-track"><span className={"repo-severity-fill severity-fill-"+item.key} style={{width:Math.min(100,(item.count/Math.max(1,latest.total_findings||0))*100)+"%"}}/></div>
    </div>)}</div>
    <p className="repo-severity-hint">Resumo consolidado do repositório. Os arquivos e as correções ficam disponíveis em cada análise.</p>
   </div>:<div className="repo-detail-empty">A distribuição de severidades estará disponível após uma análise com dados completos.</div>}</section></div>
   <section className="panel"><div className="panel-head"><div><h2>Histórico de análises</h2><p>Execuções deste repositório, da mais recente para a mais antiga</p></div></div>{ordered.length?<div className="table-scroll"><table><thead><tr><th>Data</th><th>Branch</th><th>Commit</th><th>Achados</th><th>Status</th><th></th></tr></thead><tbody>{ordered.map(a=><tr key={a.id}><td>{date(a.created_at)}</td><td>{a.branch||repo.branch}</td><td className="mono">{a.commit||"—"}</td><td>{a.total_findings??"—"}</td><td><Status value={a.status}/></td><td><Link to={"/analysis/"+a.id} aria-label="Abrir análise"><ArrowUpRight size={17}/></Link></td></tr>)}</tbody></table></div>:<div className="repo-detail-empty">Ainda não existem análises deste repositório.</div>}</section>
  </>}
 </main></Layout>
}
