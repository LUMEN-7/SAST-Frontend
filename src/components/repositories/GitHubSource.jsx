import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Github,GitBranch,ArrowRight,CheckCircle2,Info} from "lucide-react";
import "./GitHubSource.css";

export default function GitHubSource(){
 const [url,setUrl]=useState(""),[job,setJob]=useState(""),[notice,setNotice]=useState(""),[invalid,setInvalid]=useState(false);
 const navigate=useNavigate();
 function selectRepo(e){e.preventDefault();try{const u=new URL(url.trim());const parts=u.pathname.replace(/\/$/,"").split("/").filter(Boolean);if(u.hostname!=="github.com"||parts.length!==2)throw Error();setInvalid(false);setNotice("Endereço válido: "+parts.join("/")+". A conexão será disponibilizada quando o backend oferecer integração GitHub.");}catch{setInvalid(true);setNotice("Informe uma URL no formato https://github.com/organizacao/repositorio.");}}
 function openJob(e){e.preventDefault();const id=job.trim();if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)){setInvalid(true);setNotice("Informe um ID de análise válido (UUID).");return}navigate("/analysis/"+id)}
 return <div className="source-panel">
  <div className="source-intro"><span className="source-github-icon"><Github size={23}/></span><div><b>Conectar via GitHub</b><p>Informe o endereço do projeto para preparar a integração.</p></div><span className="source-availability">Em desenvolvimento</span></div>
  <form className="source-form" onSubmit={selectRepo}><label htmlFor="repository-url">URL DO REPOSITÓRIO</label><div className="source-field"><GitBranch size={17}/><input id="repository-url" type="url" required value={url} onChange={e=>{setUrl(e.target.value);setNotice("");setInvalid(false)}} placeholder="https://github.com/organizacao/repositorio"/><button className="btn btn-primary" type="submit">Verificar endereço <ArrowRight size={15}/></button></div></form>
  {notice&&<div role="status" className={"source-notice "+(invalid?"source-notice-error":"")}><Info size={15}/>{notice}</div>}
  <div className="source-bottom"><span><CheckCircle2 size={15}/> Não é necessário enviar o código-fonte.</span><form onSubmit={openJob} className="job-lookup"><label htmlFor="analysis-job">Consultar análise por ID</label><input id="analysis-job" value={job} onChange={e=>setJob(e.target.value)} placeholder="UUID da execução"/><button className="btn btn-outline" type="submit">Abrir <ArrowRight size={14}/></button></form></div>
 </div>
}