import {useState} from "react";
import {Link} from "react-router-dom";
import {ClipboardList,Search,ArrowUpRight} from "lucide-react";
import Layout from "../../components/layout/AppLayout";
import Status from "../../components/ui/AnalysisStatus";
import Empty from "../../components/ui/EmptyState";
import {readRecent} from "../../api";
import {date} from "../../utils/security";
import "./Analyses.css";
export default function Analyses(){
const [query,setQuery]=useState("");const [recent]=useState(readRecent);
const items=recent.filter(item=>[item.name,item.id,item.status].join(" ").toLowerCase().includes(query.toLowerCase()));
return <Layout><main className="container page analyses-page"><div className="page-heading"><div><h1>Análises</h1><p>Consulte execuções e abra seus relatórios de segurança.</p></div></div>
<section className="panel"><div className="panel-head"><div><h2>Histórico de análises</h2><p>Execuções registradas neste navegador. A listagem global depende de uma rota no backend.</p></div><span className="neutral-pill">{recent.length} execução(ões)</span></div>
<label className="search-field analyses-search"><Search size={17}/><input aria-label="Buscar análises" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar pelo projeto ou ID"/></label>
{items.length?<div className="table-scroll"><table><thead><tr><th>Projeto</th><th>Enviada em</th><th>Status no envio</th><th></th></tr></thead><tbody>{items.map(item=><tr key={item.id}><td><Link className="file-link" to={"/analysis/"+item.id}>{item.name||item.id.slice(0,8)}</Link><small className="mono">{item.id}</small></td><td>{date(item.at)}</td><td><Status value={item.status}/></td><td><Link aria-label="Abrir análise" to={"/analysis/"+item.id}><ArrowUpRight size={17}/></Link></td></tr>)}</tbody></table></div>:<Empty icon={ClipboardList} title={query?"Nenhuma análise encontrada":"Nenhuma análise disponível"}>{query?"Tente outro termo.":"Quando o backend fornecer a listagem das execuções do GitHub Actions, ela poderá aparecer nesta página."}</Empty>}</section>
</main></Layout>}
