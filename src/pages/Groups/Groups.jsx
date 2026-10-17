import GroupAccessInfo from "../../components/ui/GroupAccessInfo";
import { useEffect, useState } from "react";
import { Users, Plus, RefreshCw, FolderGit2 } from "lucide-react";
import Layout from "../../components/layout/AppLayout";
import { api } from "../../api";
import { severity } from "../../utils/security";
import "./Groups.css";

function groupList(data) {
  const items = Array.isArray(data) ? data : data?.groups;
  if (!Array.isArray(items)) throw new Error("A API retornou uma lista de grupos inválida.");
  return items;
}
function errorText(error) {
  if (error.status === 403) return "Sem permissão para esta ação. Seu papel no grupo pode ter sido alterado.";
  return error.message || "Não foi possível concluir a solicitação.";
}
export default function Groups() {
  const [groups,setGroups] = useState([]);
  const [selected,setSelected] = useState("");
  const [loading,setLoading] = useState(true);
  const [listError,setListError] = useState("");
  const [reload,setReload] = useState(0);
  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [role,setRole] = useState("member");
  const [repositoryId,setRepositoryId] = useState("");
  const [repos,setRepos] = useState([]);
  const [reposLoading,setReposLoading] = useState(false);
  const [reposError,setReposError] = useState("");
  const [summary,setSummary] = useState(null);
  const [summaryError,setSummaryError] = useState("");
  const [summaryLoading,setSummaryLoading] = useState(false);
  const [summaryReload,setSummaryReload] = useState(0);
  const [busy,setBusy] = useState("");
  const [notice,setNotice] = useState("");
  const [actionError,setActionError] = useState("");
  const current = groups.find(g => String(g.id) === selected);
  const admin = current?.role === "admin";
  useEffect(() => {
    let active = true;
    setLoading(true); setListError("");
    api.groups().then(groupList).then(items => {
      if (!active) return;
      setGroups(items);
      setSelected(old => items.some(g => String(g.id) === old) ? old : String(items[0]?.id ?? ""));
    }).catch(error => { if (active) setListError(errorText(error)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  },[reload]);
  useEffect(() => {
    setEmail(""); setRole("member"); setRepositoryId("");
  },[selected]);
  useEffect(() => {
    let active = true;
    setSummary(null); setSummaryError(""); setRepos([]); setReposError("");
    if (!admin || !selected) { setSummaryLoading(false); setReposLoading(false); return; }
    setSummaryLoading(true); setReposLoading(true);
    api.groupSummary(selected).then(data => { if (active) setSummary(data); })
      .catch(error => { if (active) setSummaryError(errorText(error)); })
      .finally(() => { if (active) setSummaryLoading(false); });
    api.repos().then(data => {
      if (!Array.isArray(data?.repos)) throw new Error("A API retornou uma lista de repositórios inválida.");
      if (active) setRepos(data.repos);
    }).catch(error => { if (active) setReposError(errorText(error)); })
      .finally(() => { if (active) setReposLoading(false); });
    return () => { active = false; };
  },[selected,admin,summaryReload]);
  async function create(event) {
    event.preventDefault();
    if (busy || !name.trim()) return;
    setBusy("create"); setActionError(""); setNotice("");
    try {
      const created = await api.createGroup(name.trim());
      const items = groupList(await api.groups());
      setGroups(items); setName("");
      setSelected(String(created?.id ?? items[0]?.id ?? ""));
      setNotice("Grupo criado. Você é o administrador.");
    } catch (error) { setActionError(errorText(error)); }
    finally { setBusy(""); }
  }
  async function addRepo(event) {
    event.preventDefault();
    if (!admin || busy || !repositoryId) return;
    setBusy("repo"); setActionError(""); setNotice("");
    try {
      await api.addGroupRepo(selected,repositoryId);
      setRepositoryId(""); setNotice("Repositório associado ao grupo.");
      setSummaryReload(x => x+1);
    } catch (error) { setActionError(errorText(error)); }
    finally { setBusy(""); }
  }
  async function addMember(event) {
    event.preventDefault();
    if (!admin || busy || !email.trim()) return;
    setBusy("member"); setActionError(""); setNotice("");
    try {
      await api.addGroupMember(selected,email.trim(),role);
      setEmail(""); setRole("member"); setNotice("Pessoa adicionada ao grupo.");
    } catch (error) { setActionError(errorText(error)); }
    finally { setBusy(""); }
  }
  const disabled = Boolean(busy);
  return <Layout><main className="container page groups-page">
    <div className="page-heading"><div><span className="section-kicker">ADMINISTRAÇÃO</span><h1>Grupos</h1><p>Organize repositórios e acessos da equipe.</p></div><button className="btn btn-outline" disabled={loading || disabled} onClick={() => setReload(x=>x+1)}><RefreshCw size={16}/>Atualizar grupos</button></div>
    <div className="group-entry-options"><GroupAccessInfo disabled={disabled || loading} onCheck={()=>setReload(x=>x+1)}/><form className="panel group-create" onSubmit={create}><div><h2>Novo grupo</h2><p>Quem cria o grupo recebe o papel de administrador.</p></div><label htmlFor="group-name">Nome do grupo<input id="group-name" value={name} onChange={e=>setName(e.target.value)} placeholder="Ex.: LUMEN" required disabled={disabled}/></label><button className="btn btn-primary" disabled={disabled || !name.trim()}><Plus size={16}/>{busy==="create"?"Criando…":"Criar grupo"}</button></form></div>
    {actionError && <div className="notice error" role="alert">{actionError}</div>}
    {notice && <div className="group-notice" role="status">{notice}</div>}
    {listError ? <div className="notice error" role="alert">{listError}<button className="btn btn-outline" onClick={()=>setReload(x=>x+1)}>Tentar novamente</button></div> : loading ? <section className="panel" aria-busy="true" role="status">Carregando grupos…</section> : !groups.length ? <section className="panel group-empty"><Users size={24}/><h2>Nenhum grupo nesta conta</h2><p>Crie um grupo para reunir repositórios e membros.</p></section> :
    <div className="groups-layout"><section className="panel group-picker"><h2>Meus grupos <small>{groups.length}</small></h2><div role="group" aria-label="Selecionar grupo">{groups.map(g=><button key={g.id} className="group-choice" aria-pressed={String(g.id)===selected} disabled={disabled} onClick={()=>{setNotice("");setActionError("");setSelected(String(g.id));}}><Users size={16}/><span><b>{g.name}</b><small>{g.role==="admin"?"Administrador":"Membro"}</small></span></button>)}</div></section>
    {current && <div className="group-workspace"><div className="group-heading"><div><h2>{current.name}</h2><p>{admin?"Acesso de administrador":"Acesso de membro"}</p></div></div>
    {!admin ? <section className="panel"><h2>Acesso de membro</h2><p>O resumo do grupo e o gerenciamento de acessos e repositórios estão disponíveis aos administradores.</p></section> : <>
    <section className="panel"><div className="panel-head"><div><h2>Painel do gerente</h2><p>Resultados dos repositórios deste grupo.</p></div><button className="btn btn-outline" disabled={summaryLoading || disabled} onClick={()=>setSummaryReload(x=>x+1)}><RefreshCw size={16}/>Atualizar</button></div>
    {summaryLoading ? <p role="status">Carregando resumo…</p> : summaryError ? <p role="alert">{summaryError}</p> : summary ? <><dl className="group-metrics"><div><dt>Análises realizadas</dt><dd>{summary.total_jobs ?? "—"}</dd></div><div><dt>Vulnerabilidades</dt><dd>{summary.total_findings ?? "—"}</dd></div></dl><div className="group-distribution">{["critical","high","medium","low"].map(level=><span key={level}><i style={{background:severity(level).color}}/>{severity(level).label}<b>{summary.severity_distribution?.[level] ?? "—"}</b></span>)}</div></> : <p>Nenhum resumo disponível.</p>}</section>
    <form className="panel group-form" onSubmit={addRepo}><h2><FolderGit2 size={18}/>Associar repositório</h2><p>Escolha um repositório da sua conta para incluir no grupo.</p>{reposError ? <p role="alert">{reposError}</p> : <><label htmlFor="group-repo">Repositório<select id="group-repo" value={repositoryId} onChange={e=>setRepositoryId(e.target.value)} required disabled={disabled || reposLoading}><option value="">{reposLoading?"Carregando…":"Escolha um repositório"}</option>{repos.map(repo=><option key={repo.id} value={repo.id}>{repo.full_name || repo.name || repo.id}</option>)}</select></label>{!reposLoading && !repos.length && <p>Nenhum repositório disponível na sua conta.</p>}<button className="btn btn-outline" disabled={disabled || !repositoryId}>{busy==="repo"?"Associando…":"Associar ao grupo"}</button></>}</form>
    <form className="panel group-form" onSubmit={addMember}><h2><Users size={18}/>Adicionar pessoa</h2><p>A pessoa precisa ter acessado o Ares ao menos uma vez.</p><div className="group-member-fields"><label htmlFor="group-email">E-mail<input id="group-email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required disabled={disabled} placeholder="nome@empresa.com"/></label><label htmlFor="group-role">Papel<select id="group-role" value={role} onChange={e=>setRole(e.target.value)} disabled={disabled}><option value="member">Membro</option><option value="admin">Administrador</option></select></label></div><p className="group-role-help">{role==="admin"?"Administradores acessam o painel do gerente e gerenciam membros e repositórios.":"Membros não acessam o painel do gerente."}</p><button className="btn btn-primary" disabled={disabled || !email.trim()}>{busy==="member"?"Adicionando…":"Adicionar ao grupo"}</button></form>
    </>}</div>}</div>}
  </main></Layout>;
}
