import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check, ChevronRight, Search, X } from "lucide-react";
import { severity, date } from "../../utils/security";
import "./ScanFindingsTable.css";

const options = [
  { value:"open",label:"Aberto" },
  { value:"fixed",label:"Corrigido" },
  { value:"false_positive",label:"Falso positivo" },
  { value:"accepted",label:"Risco aceito" }
];
const identity = f => [f.rule_id,f.file_path,f.line,f.message].join("|");
const rank = x => severity(x.ai_severity || x.severity).rank;
const level = x => String(x.ai_severity || x.severity || "info").toLowerCase();
const storageKey = id => "ares-triage:"+id;
function useLocalTriage(id) {
  const [map,setMap] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey(id)) || "{}"); } catch { return {}; }
  });
  useEffect(() => {
    try { setMap(JSON.parse(localStorage.getItem(storageKey(id)) || "{}")); } catch { setMap({}); }
  },[id]);
  const update = (items,status) => setMap(current => {
    const next = {...current};items.forEach(item=>{next[identity(item)]=status});
    try { localStorage.setItem(storageKey(id),JSON.stringify(next)); } catch { /* storage unavailable */ }
    return next;
  });
  return [map,update];
}
function CodeSnippet({finding}) {
  const provided = finding.code_snippet || finding.snippet || finding.code || "";
  const lines = String(provided).split("\n").slice(0,24);
  const start = Number(finding.snippet_start_line || finding.start_line || finding.line || 1);
  const affected = Number(finding.line || 0);
  return <div className="ares-code" role="region" aria-label="Trecho de código">
    {provided ? lines.map((line,i)=><div key={i} className={"ares-code-row "+(start+i===affected?"is-vulnerable":"")}>
      <span className="ares-code-number">{start+i}</span><code>{line || " "}</code>
    </div>) : <p className="ares-code-empty">Trecho não fornecido pela API. Consulte o arquivo na linha indicada.</p>}
  </div>;
}
export default function ScanFindingsTable({findings=[],analysisId,queryFile="",busy=false}) {
  const [query,setQuery]=useState(queryFile),[sev,setSev]=useState("all"),[state,setState]=useState("all");
  const [sort,setSort]=useState("severity"),[ascending,setAscending]=useState(false);
  const [selected,setSelected]=useState([]),[focused,setFocused]=useState(null);
  const [map,setStatuses]=useLocalTriage(analysisId);
  useEffect(()=>setQuery(queryFile),[queryFile]);
  const rows = useMemo(()=>findings.map((finding,index)=>({...finding,_key:identity(finding)+"#"+index,_status:map[identity(finding)] || (finding.is_false_positive ? "false_positive" : "open")})),[findings,map]);
  const visible=useMemo(()=>rows.filter(f=>(sev==="all"||level(f)===sev)&&(state==="all"||f._status===state)&&[f.rule_id,f.file_path,f.message,f.cwe].join(" ").toLowerCase().includes(query.trim().toLowerCase())).sort((a,b)=>{
    let n=sort==="severity"?rank(a)-rank(b):sort==="date"?(new Date(a.created_at||0)-new Date(b.created_at||0)):String(a[sort]||"").localeCompare(String(b[sort]||""));
    return ascending?n:-n;
  }),[rows,sev,state,query,sort,ascending]);
  const active=focused==="__closed__" ? null : (visible.find(f=>f._key===focused) || visible[0] || null);
  const checked=visible.length>0 && visible.every(f=>selected.includes(f._key));
  const counts=["critical","high","medium","low","info"].map(s=>({name:s,count:rows.filter(f=>level(f)===s).length}));
  function setRowStatus(items,value){setStatuses(items,value);setSelected([]);}
  useEffect(()=>{
    const handle=e=>{
      const target=e.target;
      if(target instanceof HTMLElement && (["INPUT","SELECT","TEXTAREA"].includes(target.tagName)||target.isContentEditable)|| e.ctrlKey||e.metaKey||e.altKey) return;
      if(!visible.length) return;
      const index=Math.max(0,visible.findIndex(f=>f._key===focused));
      if(e.key==="j"||e.key==="k"){e.preventDefault();setFocused(visible[Math.max(0,Math.min(visible.length-1,index+(e.key==="j"?1:-1)))]._key);}
      if(e.key==="f"&&active){e.preventDefault();setRowStatus([active],"false_positive");}
      if(e.key==="r"&&active){e.preventDefault();setRowStatus([active],"fixed");}
      if(e.key==="a"&&active){e.preventDefault();setRowStatus([active],"accepted");}
    };
    window.addEventListener("keydown",handle);return()=>window.removeEventListener("keydown",handle);
  },[visible,focused,active]);
  function header(key,title){return <button className="ares-sort" onClick={()=>{if(sort===key)setAscending(!ascending);else{setSort(key);setAscending(key!=="severity");}}}>{title}{sort===key?(ascending?<ArrowUp size={12}/>:<ArrowDown size={12}/>):null}</button>}
  return <section className="ares-triage">
    <header className="ares-triage-head"><div><h2>Achados</h2><span>{rows.length} achados · {counts.find(c=>c.name==="critical").count} críticos</span></div><span className="ares-local-label">Triagem salva neste navegador</span></header>
    <div className="ares-severity-bar" aria-label="Distribuição por severidade">{counts.filter(x=>x.count).map(x=><span key={x.name} className={"ares-segment sev-"+x.name} style={{width:(100*x.count/Math.max(1,rows.length))+"%"}} title={severity(x.name).label+": "+x.count}/>)}</div>
    <div className="ares-distribution">{counts.map(x=><span key={x.name}><i className={"ares-severity-point sev-"+x.name}/>{severity(x.name).label} <b>{x.count}</b></span>)}</div>
    <div className="ares-toolbar">
      <label className="ares-search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Regra, arquivo, CWE…" aria-label="Pesquisar achados"/></label>
      <select aria-label="Filtrar severidade" value={sev} onChange={e=>setSev(e.target.value)}><option value="all">Todas as severidades</option>{counts.map(x=><option key={x.name} value={x.name}>{severity(x.name).label}</option>)}</select>
      <select aria-label="Filtrar status" value={state} onChange={e=>setState(e.target.value)}><option value="all">Todos os status</option>{options.map(x=><option key={x.value} value={x.value}>{x.label}</option>)}</select>
      {selected.length>0&&<div className="ares-bulk"><span>{selected.length} selecionado(s)</span><select aria-label="Alterar status em massa" value="" onChange={e=>{if(e.target.value)setRowStatus(rows.filter(r=>selected.includes(r._key)),e.target.value);}}><option value="">Alterar status…</option>{options.map(x=><option key={x.value} value={x.value}>{x.label}</option>)}</select></div>}
    </div>
    <div className="ares-table-wrap"><table className="ares-table"><thead><tr>
      <th className="ares-check"><input aria-label="Selecionar todos os achados filtrados" type="checkbox" checked={checked} onChange={e=>setSelected(e.target.checked?visible.map(f=>f._key):[])}/></th>
      <th>{header("severity","Severidade")}</th><th>{header("rule_id","Regra")}</th><th>{header("file_path","Arquivo:linha")}</th><th>Status</th><th>{header("date","Data")}</th><th/>
    </tr></thead><tbody>{visible.map(f=><tr key={f._key} className={active?._key===f._key?"is-focused":""}>
      <td><input aria-label={"Selecionar "+(f.rule_id||"achado")} type="checkbox" checked={selected.includes(f._key)} onChange={e=>setSelected(old=>e.target.checked?[...old,f._key]:old.filter(k=>k!==f._key))}/></td>
      <td><span className="ares-severity"><i className={"ares-severity-point sev-"+level(f)}/>{severity(level(f)).label}</span></td>
      <td><button className="ares-rule-link" onClick={()=>setFocused(f._key)}>{f.rule_id||"Regra não informada"}</button><small>{f.message}</small></td>
      <td className="ares-mono">{f.file_path||"—"}{f.line?":"+f.line:""}</td>
      <td><span className={"ares-state state-"+f._status}>{options.find(x=>x.value===f._status)?.label||"Aberto"}</span></td>
      <td className="ares-muted">{f.created_at?date(f.created_at):"—"}</td>
      <td><button className="ares-open" aria-label="Abrir detalhe" onClick={()=>setFocused(f._key)}><ChevronRight size={16}/></button></td>
    </tr>)}</tbody></table>
      {!visible.length && <div className="ares-no-results">{busy?"Carregando achados…":rows.length?"Nenhum achado corresponde aos filtros.":"Nenhum achado neste scan."}</div>}
    </div>
    {active&&<div className="ares-detail">
      <div className="ares-detail-head"><div><span className="ares-eyebrow">DETALHE DO ACHADO</span><h3>{active.rule_id||"Achado"}</h3><p className="ares-mono">{active.file_path||"Arquivo não informado"}{active.line?":"+active.line:""}</p></div><button className="ares-open" aria-label="Fechar detalhe" onClick={()=>setFocused("__closed__")}><X size={17}/></button></div>
      <div className="ares-detail-grid"><div><h4>Trecho de código</h4><CodeSnippet finding={active}/></div><div className="ares-detail-info"><h4>Risco</h4><p>{active.ai_explanation||active.message||"Sem descrição fornecida pela análise."}</p><div className="ares-kv"><span>CWE</span><code>{active.cwe||"—"}</code><span>Ferramenta</span><code>{active.tool||"SAST"}</code><span>Estado</span><span>{options.find(x=>x.value===active._status)?.label}</span></div><h4>Correção recomendada</h4><p>{active.ai_suggestion||"Revise a entrada de dados e aplique a correção conforme a regra identificada."}</p><label className="ares-status-control">Triagem local<select aria-label="Status do achado" value={active._status} onChange={e=>setRowStatus([active],e.target.value)}>{options.map(x=><option key={x.value} value={x.value}>{x.label}</option>)}</select></label></div></div>
    </div>}
    <footer className="ares-shortcuts"><span><kbd>J</kbd>/<kbd>K</kbd> navegar</span><span><kbd>F</kbd> falso positivo</span><span><kbd>R</kbd> corrigido</span><span><kbd>A</kbd> aceitar risco</span><span>Atalhos funcionam fora de campos de edição</span></footer>
  </section>;
}
