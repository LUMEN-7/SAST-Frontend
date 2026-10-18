import { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { api } from "../../api";
import { repositoryError, manualCheckInstructions } from "../../services/repositoryConfig";
import "./RepositoryConfig.css";
import GitHubIcon from "../ui/GitHubIcon";

export default function AddRepository({ onClose, onConnected }) {
  const dialog = useRef(null);
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ repos: [], has_next: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [protect, setProtect] = useState(true);
  const [admins, setAdmins] = useState(true);
  const [conflict, setConflict] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [connecting, setConnecting] = useState(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(null); setUnauthorized(false); setConflict(null);
    api.availableRepos(page).then(result => {
      if (active) setData({ repos: result.repos || result.items || [], has_next: result.has_next === true });
    }).catch(err => {
      if (!active) return;
      if (err.status === 401 || err.code === "unauthorized") setUnauthorized(true);
      else setError(err);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, retry]);
  async function connect(repo, overrides = {}) {
    if (repo.permissions?.admin === false || repo.archived || repo.connected) return;
    setConnecting(repo.full_name); setError(null); setConflict(null);
    try {
      const result = await api.connectRepo(repo, { protect, enforce_admins: admins, overwrite_existing: false, ...overrides });
      // The monitored list refreshes independently; a failed refresh never
      // turns a successful connection into another POST attempt.
      onConnected({ ...result, manualCheck: overrides.protect === false ? manualCheckInstructions : "" });
    } catch (err) { setError(err); if (err.code === "existing_protection") setConflict(repo); if (err.code === "unauthorized" || err.status === 401) setUnauthorized(true); setConnecting(null); }
  }
  return <dialog ref={dialog} className="repo-add-dialog" aria-labelledby="repo-add-title" onCancel={event => { event.preventDefault(); if (connecting === null) onClose(); }}>
    <div className="repo-add-header"><div><h2 id="repo-add-title">Adicionar repositório</h2><p>Escolha um projeto do GitHub para monitorar.</p></div><button type="button" className="repo-dialog-close" aria-label="Fechar painel" disabled={connecting !== null} onClick={onClose}><X size={20} /></button></div>
    {loading ? <p role="status" className="repo-add-feedback">Carregando repositórios…</p> : unauthorized ? <div className="repo-add-feedback"><GitHubIcon size={28} /><p>Entre com GitHub para listar os repositórios disponíveis.</p><a className="btn btn-primary" href={api.githubUrl()}><GitHubIcon size={16} /> Entrar com GitHub</a></div> : <>
      <fieldset className="repo-config-options" disabled={connecting !== null}><legend>Configuração ao conectar</legend><label><input type="checkbox" checked={protect} onChange={event => setProtect(event.target.checked)} /> Exigir sast para permitir merges</label><label><input type="checkbox" checked={admins} disabled={!protect} onChange={event => setAdmins(event.target.checked)} /> Aplicar proteção também aos administradores</label></fieldset>
      {conflict && <div className="repo-config-warning"><p>A branch já tem proteção. Sobrescrever substitui a configuração atual.</p><div className="repo-conflict-actions"><button type="button" className="btn btn-outline" disabled={connecting !== null} onClick={() => connect(conflict, { protect: true, overwrite_existing: true })}>Sobrescrever</button><button type="button" className="btn btn-outline" disabled={connecting !== null} onClick={() => connect(conflict, { protect: false })}>Adicionar o check sast manualmente</button></div><p>{manualCheckInstructions}</p></div>}
      {error && <div role="alert" className="notice error">{repositoryError(error)}<button type="button" className="btn btn-outline" disabled={connecting !== null} onClick={() => setRetry(value => value + 1)}>Tentar novamente</button></div>}
      {!error && !data.repos.length && <p className="repo-add-feedback">Nenhum repositório disponível nesta página.</p>}
      <div className="repo-available-list">{data.repos.map(repo => <div className="repo-available-row" key={repo.full_name}><GitHubIcon size={19} /><div className="repo-available-name"><b>{repo.full_name}</b>{repo.permissions?.admin === false && <small>Precisa ser admin do repo</small>}{repo.archived && <small>Repo arquivado</small>}</div><button type="button" className="btn btn-outline" disabled={repo.connected || repo.permissions?.admin === false || repo.archived || connecting !== null} onClick={() => connect(repo)}>{repo.connected ? "Já conectado" : connecting === repo.full_name ? "Conectando…" : <><Plus size={15} /> Conectar</>}</button></div>)}</div>
      {!error && <nav className="repo-pagination" aria-label="Páginas de repositórios"><span>Página {page}</span><div>{page > 1 && <button type="button" className="btn btn-outline" disabled={connecting !== null} onClick={() => setPage(value => value - 1)}><ChevronLeft size={16} /> Anterior</button>}{data.has_next && <button type="button" className="btn btn-outline" disabled={connecting !== null} onClick={() => setPage(value => value + 1)}>Próxima <ChevronRight size={16} /></button>}</div></nav>}
    </>}
  </dialog>;
}
