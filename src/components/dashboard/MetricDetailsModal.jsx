import {useEffect} from "react";
import {Link} from "react-router-dom";
import {X,ArrowUpRight,ShieldAlert,ClipboardList} from "lucide-react";
import {date,severity} from "../../utils/security";
import Tag from "../ui/SeverityTag";
import {isDemo} from "../../services/sastService";
import "./MetricDetailsModal.css";

const config={
 analyses:["Análises realizadas","Execuções recentes e seus resultados"],
 findings:["Vulnerabilidades","Achados agrupados por projeto e arquivos identificados"],
 critical:["Riscos críticos","Projetos com vulnerabilidades críticas"],
 high:["Riscos altos","Projetos com vulnerabilidades de alta severidade"]
};
export default function MetricDetailsModal({type,onClose,analyses=[],alerts=[],summary}){
 useEffect(()=>{if(!type)return;const handle=e=>{if(e.key==="Escape")onClose()};document.addEventListener("keydown",handle);return()=>document.removeEventListener("keydown",handle)},[type,onClose]);
 if(!type)return null;
 const [title,subtitle]=config[type]||config.findings;
 const rows=analyses.filter(a=>type==="analyses"||type==="findings"||Number(a[type]||0)>0);
 const matchingAlerts=alerts.filter(a=>type==="findings"||a.severity===type);
 return <div className="metric-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
 <section className="metric-dialog" role="dialog" aria-modal="true" aria-labelledby="metric-title">
 <div className="metric-dialog-header"><div><span className="metric-eyebrow">VISÃO DETALHADA {isDemo?"· DEMONSTRAÇÃO":""}</span><h2 id="metric-title">{title}</h2><p>{subtitle}</p></div><button className="metric-close" onClick={onClose} aria-label="Fechar"><X size={19}/></button></div>
 <div className="metric-dialog-content">
 {rows.length?<div className="metric-projects">{rows.map(a=><Link key={a.id} to={"/analysis/"+a.id} onClick={onClose} className="metric-project"><span className="metric-project-icon"><ClipboardList size={17}/></span><span className="metric-project-name"><b>{a.repo_name||a.name||a.id}</b><small>{date(a.created_at||a.at)} · {a.commit||"Análise registrada"}</small></span><span className="metric-project-count">{type==="analyses"?"Ver análise":type==="findings"?(a.total_findings??"—")+" achados":(a[type]??0)+" "+severity(type).label.toLowerCase()}</span><ArrowUpRight size={16}/></Link>)}</div>:<p className="metric-no-results">Nenhuma análise correspondente disponível.</p>}
 {type!=="analyses"&&<><h3>Arquivos identificados</h3>{matchingAlerts.length?<div className="metric-alerts">{matchingAlerts.map(a=>{const job=analyses.find(j=>j.repository_id===a.repository_id);return <div className="metric-alert-row" key={a.id}><Tag name={a.severity}/><span><b>{a.repository}</b><small>{a.file}</small></span>{job?<Link onClick={onClose} to={"/analysis/"+job.id} aria-label={"Abrir análise de "+a.repository}><ArrowUpRight size={17}/></Link>:null}</div>})}</div>:<p className="metric-no-results">O backend ainda não fornece a relação de arquivos para este indicador.</p>}<p className="metric-data-note">Os arquivos acima representam apenas as ocorrências disponíveis; o total do indicador pode incluir outros achados.</p></>}
 </div><div className="metric-dialog-footer"><button onClick={onClose} className="btn btn-outline">Fechar</button><Link className="btn btn-primary" to="/analyses" onClick={onClose}>Todas as análises <ArrowUpRight size={15}/></Link></div>
 </section></div>
}
