import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { initialProtection, repositoryError, protectionWarning, manualCheckInstructions } from "../../services/repositoryConfig";
import "./RepositoryConfig.css";
export default function RepositorySettings({ repo, onDisconnected }) {
  const [enabled, setEnabled] = useState(() => initialProtection(repo));
  const [admins, setAdmins] = useState(repo.enforce_admins === true);
  const [state, setState] = useState(repo.protection_state);
  const [busy, setBusy] = useState(false), [error, setError] = useState(null), [message, setMessage] = useState("");
  const [confirm, setConfirm] = useState(false), [removed, setRemoved] = useState(false);
  const [warning, setWarning] = useState(() => protectionWarning(repo));
  async function update(nextEnabled, nextAdmins) {
    setBusy(true); setError(null); setMessage("");
    try {
      const result = await api.updateRepo(repo.id, { protection_enabled: nextEnabled, enforce_admins: nextAdmins });
      if (result?.protection_error) {
        setWarning(protectionWarning(result));
        const actual = initialProtection(result); if (actual !== null) setEnabled(actual);
      } else {
        setEnabled((result ? initialProtection(result) : null) ?? nextEnabled);
        setAdmins(typeof result?.enforce_admins === "boolean" ? result.enforce_admins : nextAdmins);
        setWarning(""); setMessage("Configuração atualizada.");
      }
      if (result?.protection_state) setState(result.protection_state);
    } catch (err) { setError(err); } finally { setBusy(false); }
  }
  async function disconnect() {
    setBusy(true); setError(null);
    try {
      const result = await api.disconnectRepo(repo.id);
      const errors = result?.errors;
      const hasErrors = Array.isArray(errors) ? errors.length > 0 : errors && (typeof errors !== "object" || Object.keys(errors).length > 0);
      setRemoved(true); setConfirm(false);
      setWarning(hasErrors ? "Repositório desconectado da plataforma. O webhook pode ter ficado órfão no GitHub. Verifique Settings → Webhooks e a proteção da branch." : "");
      onDisconnected?.();
    } catch (err) { setError(err); } finally { setBusy(false); }
  }
  if (removed) return <section className="panel repo-settings"><h2>Repositório desconectado</h2>{warning && <p className="repo-config-warning" role="status">{warning}</p>}<Link className="btn btn-outline" to="/repositories">Voltar aos repositórios</Link></section>;
  return <section className="panel repo-settings"><h2>Proteção e conexão</h2><p>Configure o check sast na branch {repo.default_branch || repo.branch || "padrão"}.</p>{state && <p>Estado da proteção: {state}</p>}
    {error && <div role="alert" className="notice error">{repositoryError(error)}{(error.code === "unauthorized" || error.status === 401) && <a className="btn btn-outline" href={api.githubUrl()}>Entrar com GitHub</a>}{error.code === "existing_protection" && <p>{manualCheckInstructions}</p>}</div>}
    {warning && <div className="repo-config-warning" role="status">{warning}</div>}{message && <p role="status">{message}</p>}
    <fieldset className="repo-config-options" disabled={busy || repo.permissions?.admin === false}><legend>Branch protection</legend><label><input type="checkbox" role="switch" checked={enabled === true} onChange={event => update(event.target.checked, admins)} /> Exigir sast para permitir merges</label>{enabled === null && <small>Estado atual não informado pelo backend.</small>}<label><input type="checkbox" role="switch" checked={admins} disabled={enabled !== true} onChange={event => update(enabled === true, event.target.checked)} /> Aplicar proteção também aos administradores</label></fieldset>
    <div className="repo-disconnect"><h3>Desconectar repositório</h3><p>Solicita a limpeza do webhook e do contexto sast. A proteção inteira só é removida pelo backend se foi criada pela plataforma.</p>{confirm ? <div className="repo-conflict-actions"><p>Desconectar {repo.full_name}?</p><button type="button" className="btn btn-outline" disabled={busy} onClick={disconnect}>{busy ? "Desconectando…" : "Confirmar desconexão"}</button><button type="button" className="btn btn-outline" disabled={busy} onClick={() => setConfirm(false)}>Cancelar</button></div> : <button type="button" className="btn btn-outline" disabled={busy} onClick={() => setConfirm(true)}>Desconectar</button>}</div>
  </section>;
}
