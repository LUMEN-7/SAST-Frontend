export function maskEmail(email) {
  if (typeof email !== "string") return "***";
  const at = email.lastIndexOf("@");
  if (at < 1 || at === email.length - 1) return "***";
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  return `${local.slice(0, local.length > 2 ? 2 : 1)}***@${domain}`;
}

export default function LinkingStep({ email, authenticated, busy, passwordMode, onProvider, onConfirm, onPassword, onCancel, children }) {
  return <section className="auth-linking" aria-label="Unificar acessos">
    <h3>Unificar acessos</h3>
    <p>Confirme a conta de <b>{maskEmail(email)}</b> com o método que você já usava.</p>
    {authenticated ? <button type="button" className="auth-submit" disabled={busy} onClick={onConfirm}>Concluir vinculação</button> : <>
      <button type="button" className="auth-submit" disabled={busy} onClick={() => onProvider("google.com")}>Confirmar com Google</button>
      <button type="button" className="auth-submit" disabled={busy} onClick={() => onProvider("github.com")}>Confirmar com GitHub</button>
      <p className="auth-link-help">Para Google ou GitHub, confirme na janela que abrir. Esses botões não exigem senha neste formulário.</p>
      <button type="button" className="auth-secondary" disabled={busy} onClick={onPassword}>{passwordMode ? "Voltar aos provedores" : "Minha conta usa senha"}</button>
      {passwordMode && children}
    </>}
    <button type="button" className="auth-secondary" disabled={busy} onClick={onCancel}>Cancelar vinculação</button>
  </section>;
}
