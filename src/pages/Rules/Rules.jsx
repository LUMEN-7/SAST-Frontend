import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import Layout from "../../components/layout/AppLayout";
import "./Rules.css";
const catalog=[
 {id:"java.spring.sqli.string-concat",cwe:"CWE-89",lang:"Java",severity:"critical",description:"Concatenação de entrada em consultas SQL"},
 {id:"java.lang.security.audit.hardcoded-secret",cwe:"CWE-798",lang:"Java",severity:"high",description:"Credencial fixa no código-fonte"},
 {id:"javascript.browser.security.insecure-innerhtml",cwe:"CWE-79",lang:"JavaScript",severity:"high",description:"HTML não confiável inserido no DOM"},
 {id:"typescript.express.security.xss",cwe:"CWE-79",lang:"TypeScript",severity:"high",description:"Saída não sanitizada em resposta HTTP"},
 {id:"python.django.security.sql-injection",cwe:"CWE-89",lang:"Python",severity:"critical",description:"Consulta SQL construída com interpolação"},
 {id:"javascript.node.security.path-traversal",cwe:"CWE-22",lang:"JavaScript",severity:"medium",description:"Caminho controlado pelo usuário sem validação"}
];
export default function Rules(){
 const [disabled,setDisabled]=useState(()=>{try{return JSON.parse(localStorage.getItem("ares-rule-preferences")||"[]")}catch{return[]}});
 const [q,setQ]=useState(""),[lang,setLang]=useState("all"),[sev,setSev]=useState("all");
 const filtered=useMemo(()=>catalog.filter(r=>(lang==="all"||r.lang===lang)&&(sev==="all"||r.severity===sev)&&[r.id,r.cwe,r.description].join(" ").toLowerCase().includes(q.toLowerCase())),[q,lang,sev]);
 function toggle(id){const next=disabled.includes(id)?disabled.filter(x=>x!==id):[...disabled,id];setDisabled(next);localStorage.setItem("ares-rule-preferences",JSON.stringify(next));}
 return <Layout><main className="container page ares-rules"><div className="page-heading"><div><h1>Configurações de regras</h1><p>Catálogo de referência · preferências armazenadas somente neste navegador.</p></div></div>
 <div className="ares-rule-notice" role="note">Alterações neste catálogo não modificam o scanner. A sincronização de regras depende de um endpoint de configuração da API.</div>
 <section className="panel"><div className="ares-rules-tools"><label className="ares-rule-search"><Search size={15}/><input aria-label="Pesquisar regras" placeholder="ID, descrição ou CWE" value={q} onChange={e=>setQ(e.target.value)}/></label><select aria-label="Linguagem" value={lang} onChange={e=>setLang(e.target.value)}><option value="all">Todas as linguagens</option>{["Java","JavaScript","TypeScript","Python"].map(x=><option key={x}>{x}</option>)}</select><select aria-label="Severidade" value={sev} onChange={e=>setSev(e.target.value)}><option value="all">Todas as severidades</option>{["critical","high","medium"].map(x=><option key={x} value={x}>{({critical:"Crítica",high:"Alta",medium:"Média"})[x]}</option>)}</select></div>
 <div className="ares-rule-list"><div className="ares-rule-row ares-rule-heading"><span>REGRA</span><span>LINGUAGEM</span><span>SEVERIDADE</span><span>ATIVAÇÃO LOCAL</span></div>{filtered.map(r=><div className="ares-rule-row" key={r.id}><div><strong>{r.id}</strong><small>{r.cwe} · {r.description}</small></div><span>{r.lang}</span><span className={"ares-rule-sev is-"+r.severity}>{({critical:"Crítica",high:"Alta",medium:"Média"})[r.severity]}</span><label className="ares-rule-toggle"><input type="checkbox" checked={!disabled.includes(r.id)} onChange={()=>toggle(r.id)} aria-label={"Ativar preferência local da regra "+r.id}/><span>{disabled.includes(r.id)?"Desativada":"Ativada"}</span></label></div>)}{!filtered.length&&<p className="ares-rule-empty">Nenhuma regra corresponde aos filtros.</p>}</div></section></main></Layout>;
}
