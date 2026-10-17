import { useState } from "react";
import { Link } from "react-router-dom";
import { GitBranch, ArrowLeft } from "lucide-react";
import Layout from "../components/layout/AppLayout";
import ScanFindingsTable from "../components/analysis/ScanFindingsTable";
const findings=[
 {rule_id:"java.spring.sqli.string-concat",severity:"critical",file_path:"src/main/java/com/acme/auth/LoginService.java",line:84,snippet_start_line:81,code_snippet:'public User findByEmail(String email) {\n    // Entrada recebida pelo endpoint de login\n    String query = "SELECT * FROM users WHERE email = \'"\n        + email + "\'";\n    return jdbcTemplate.queryForObject(query, userMapper);\n}',message:"Entrada do usuário concatenada em consulta SQL.",cwe:"CWE-89",ai_explanation:"O parâmetro email altera a consulta SQL. Uma entrada manipulada pode acessar registros sem autorização.",ai_suggestion:"Use parâmetros vinculados: jdbcTemplate.queryForObject(\"SELECT * FROM users WHERE email = ?\", userMapper, email).",created_at:"2026-10-17T13:42:00-03:00"},
 {rule_id:"java.lang.security.audit.hardcoded-secret",severity:"high",file_path:"src/main/java/com/acme/config/PaymentConfig.java",line:26,code_snippet:'String apiKey = "sk_test_example_revoked";',message:"Chave de serviço definida no código.",cwe:"CWE-798",ai_suggestion:"Remova a chave, revogue a credencial e leia o valor de um gerenciador de segredos.",created_at:"2026-10-17T13:42:00-03:00"},
 {rule_id:"javascript.browser.security.insecure-innerhtml",severity:"high",file_path:"src/web/components/Comment.tsx",line:38,code_snippet:"preview.innerHTML = comment.body;",message:"Conteúdo não confiável inserido no DOM.",cwe:"CWE-79",is_false_positive:true,created_at:"2026-10-17T13:42:00-03:00"},
 {rule_id:"javascript.node.security.path-traversal",severity:"medium",file_path:"src/api/routes/download.ts",line:19,code_snippet:"res.sendFile(path.join(uploadDir, req.query.file));",message:"Nome de arquivo controlado pela requisição.",cwe:"CWE-22",status:"fixed",created_at:"2026-10-17T13:42:00-03:00"},
 {rule_id:"python.requests.security.disabled-cert-validation",severity:"low",file_path:"services/billing/client.py",line:52,code_snippet:"response = requests.get(endpoint, verify=False)",message:"Validação de certificado TLS desativada.",cwe:"CWE-295",created_at:"2026-10-17T13:42:00-03:00"}
];
const tabs=["Resultado do scan","Projetos","Estados"];
export default function DesignReview(){
 const [tab,setTab]=useState(tabs[0]);
 return <Layout><main className="container page"><div className="page-heading"><div><span className="section-kicker">REVISÃO VISUAL / DADOS DE EXEMPLO</span><h1>{tab==="Resultado do scan"?"acme / identity-service":tab}</h1><p className="design-note">Ambiente de revisão. Nenhum repositório real é alterado.</p></div><Link className="btn btn-outline" to="/rules">Configurações de regras</Link></div>
 <nav className="design-tabs" aria-label="Telas de revisão">{tabs.map(t=><button key={t} aria-pressed={tab===t} onClick={()=>setTab(t)}>{t}</button>)}<Link className="btn btn-outline" to="/login">Login</Link><Link className="btn btn-outline" to="/register">Cadastro</Link></nav>
 {tab===tabs[0]&&<><div className="design-meta"><span><GitBranch size={13}/> main</span><code>commit 8e4a7c2</code><span>Scan #184 · Concluído</span><span>17 out. 2026, 13:42 · 48 s</span></div><ScanFindingsTable analysisId="design-review" findings={findings}/></>}
 {tab===tabs[1]&&<div className="design-state design-table-wrap"><table className="design-table"><thead><tr>{["Repositório","Branch","Último scan","Achados","Status"].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{[["identity-service","main","Há 12 min","1 crítico · 2 altos · 1 médio · 1 baixo","Concluído"],["payment-gateway","release/2.8","Agora","—","Em andamento"],["customer-portal","main","Há 2 h","0 achados","Concluído"]].map(r=><tr key={r[0]}><td><button className="ares-rule-link" onClick={()=>setTab(tabs[0])}>acme / {r[0]}</button></td>{r.slice(1).map((v,i)=><td key={i}>{v}</td>)}</tr>)}</tbody></table></div>}
 {tab===tabs[2]&&<>
 <section className="design-state" role="status"><h2>Scan em andamento</h2><p>acme/payment-gateway · release/2.8</p><p>384 de 600 arquivos analisados · 32 s</p><div className="design-progress" role="progressbar" aria-label="Arquivos analisados" aria-valuenow={64} aria-valuemin={0} aria-valuemax={100}><span/></div></section>
 <section className="design-state"><h2>Scan concluído · nenhum achado</h2><p>Nenhuma ocorrência nas regras habilitadas. 600 arquivos analisados.</p></section>
 <section className="design-state" role="alert"><h2>Falha ao clonar o repositório</h2><p>acme/private-api · O provedor recusou o acesso. Revise as permissões da integração.</p><Link className="btn btn-outline" to="/account">Revisar acesso</Link></section>
 <section className="design-state"><h2>Nenhum projeto conectado</h2><p>Conecte um repositório para iniciar o primeiro scan.</p><Link className="btn btn-primary" to="/repositories">Conectar repositório</Link></section>
 <section className="design-state" aria-busy="true" aria-label="Carregando achados"><h2>Carregando achados</h2><div className="design-skeleton" aria-hidden="true">{[1,2,3].map(i=><span key={i}/>)}</div></section>
 <div className="design-toast" role="status">Achado marcado como falso positivo · Salvo neste navegador</div>
 <div className="design-toast" role="status">Achado corrigido · Salvo neste navegador</div>
 <section className="design-state"><h2>Controles</h2><div className="design-tabs"><button className="btn btn-primary">Iniciar scan</button><button className="btn btn-outline">Cancelar</button><button className="btn btn-danger" disabled>Excluir projeto</button><button disabled>Scan indisponível</button></div></section>
 </>}
 </main></Layout>;
}
export function NotFound(){return <Layout><main className="container page"><span className="section-kicker">ERRO 404</span><h1>Página não encontrada</h1><p>Confira o endereço ou volte aos projetos.</p><Link className="btn btn-outline" to="/repositories"><ArrowLeft size={15}/>Ver repositórios</Link></main></Layout>}
