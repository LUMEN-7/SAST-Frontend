import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Github, ShieldCheck, Eye, EyeOff, ArrowRight } from "lucide-react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, sendPasswordResetEmail, updateProfile, linkWithCredential, signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useAuth } from "../../auth/AuthContext";
import { authError } from "../../auth/errors";
import { completeAccountLink } from "../../auth/linkAccount";
import LinkingStep, { maskEmail } from "./LinkingStep";
import Brand from "../../components/layout/Brand";
import ThemeToggle from "../../components/layout/ThemeToggle";
import "./Auth.css";

export function Providers({ onSelect, disabled, linked = [] }) {
  return <div className="auth-providers">{[["google.com", "Google"], ["github.com", "GitHub"]].map(([id, name]) => <button key={id} type="button" disabled={disabled || linked.includes(id)} onClick={() => onSelect(id)}>{id === "github.com" ? <Github size={19} /> : <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={{flexShrink:0}}>
<path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.89-1.74 2.98-4.3 2.98-7.36Z"/>
<path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.76-5.6-4.12H3.06v2.59A10 10 0 0 0 12 22Z"/>
<path fill="#FBBC05" d="M6.4 13.91a6 6 0 0 1 0-3.82V7.5H3.06a10 10 0 0 0 0 9l3.34-2.59Z"/>
<path fill="#EA4335" d="M12 5.97c1.47 0 2.79.51 3.82 1.51l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.5l3.34 2.59A5.99 5.99 0 0 1 12 5.97Z"/>
</svg>}{name}{linked.includes(id) && " · Vinculado"}</button>)}</div>;
}
export const providerFor = (id) => {
  if (id === "google.com") {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    return provider;
  }
  return new GithubAuthProvider();
};

export default function AuthPage() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const register = location.pathname === "/register";
  const reset = location.pathname === "/forgot-password";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  // OAuth credentials stay in memory only, until the existing account is confirmed.
  const [pendingLink, setPendingLink] = useState(null);
  async function finishLink(result) {
    if (!pendingLink) return;
    await completeAccountLink(result.user, pendingLink, {
      link: linkWithCredential, logout: () => signOut(auth),
    });
    setPendingLink(null);
  }
  async function socialLogin(id) {
    try {
      await finishLink(await signInWithPopup(auth, providerFor(id)));
    } catch (err) {
      if (err.code !== "auth/account-exists-with-different-credential" || pendingLink) throw err;
      // Extract with the provider actually used. Both SDK helpers can read
      // oauthAccessToken, so trying Google first can mislabel a GitHub token.
      const credential = id === "google.com"
        ? GoogleAuthProvider.credentialFromError(err)
        : GithubAuthProvider.credentialFromError(err);
      const email = err.customData?.email;
      if (!credential || !email) throw err;
      setPasswordMode(false);
      setPendingLink({ credential, email });
    }
  }
  async function run(action) {
    setError(""); setMessage(""); setBusy(true);
    try { await action(); } catch (err) { setError(authError(err)); } finally { setBusy(false); }
  }
  function submit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = pendingLink?.email || data.get("email").trim();
    const password = data.get("password");
    if (register && !pendingLink && password !== data.get("confirm")) { setError("As senhas precisam ser iguais."); return; }
    run(async () => {
      if (reset) { await sendPasswordResetEmail(auth, email); setMessage("Se houver uma conta para este e-mail, você receberá as instruções de recuperação."); }
      else if (register && !pendingLink) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        try { await updateProfile(result.user, { displayName: data.get("name").trim() }); }
        catch { /* The account was created; the display name is optional. */ }
      } else await finishLink(await signInWithEmailAndPassword(auth, email, password));
    });
  }
  if (loading) return <div className="auth-loading" role="status">Carregando sessão…</div>;
  if (user && !busy && !pendingLink) return <Navigate to="/" replace />;
  const emailForm = <form onSubmit={submit}>
    {register && !pendingLink && <label>Nome<input name="name" autoComplete="name" required maxLength={100} disabled={busy} /></label>}
    <label>E-mail<input key={pendingLink ? "masked-email" : "email"} defaultValue={pendingLink ? maskEmail(pendingLink.email) : ""} readOnly={Boolean(pendingLink)} name="email" type={pendingLink ? "text" : "email"} autoComplete={pendingLink ? "off" : "email"} required placeholder="voce@empresa.com" disabled={busy} /></label>
    {!reset && <label>Senha<div className="auth-password"><input name="password" type={visible ? "text" : "password"} autoComplete={register && !pendingLink ? "new-password" : "current-password"} required minLength={register && !pendingLink ? 6 : undefined} disabled={busy} /><button type="button" aria-label={visible ? "Ocultar senha" : "Mostrar senha"} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>}
    {register && !pendingLink && <label>Confirme a senha<input name="confirm" type={visible ? "text" : "password"} autoComplete="new-password" required minLength={6} disabled={busy} /></label>}
    {!reset && <Link className="auth-forgot" to="/forgot-password">Esqueci minha senha</Link>}
    <button type="submit" className="auth-submit" disabled={busy || !auth}>{busy ? "Aguarde…" : reset ? "Enviar link de recuperação" : pendingLink ? "Confirmar senha e vincular" : register ? "Criar conta" : "Entrar"}<ArrowRight size={17} /></button>
  </form>;
  return <main className="auth-page">
    <aside className="auth-intro"><Brand /><div><span className="auth-eyebrow">SAST / REVISÃO DE CÓDIGO</span><h1>Revisão de segurança<br />de código.</h1><p>Consulte scans, revise vulnerabilidades e acompanhe os repositórios conectados.</p><div className="auth-feature"><ShieldCheck size={23} /><span>Acesso aos resultados e ao histórico<br />das análises.</span></div></div><small>ARES · LUMEN SECURITY</small></aside>
    <section className="auth-content"><div className="auth-card"><div className="auth-theme"><ThemeToggle /></div>
      <span className="auth-eyebrow">ACESSO AO ARES</span>
      <h2>{pendingLink ? "Confirme sua conta" : reset ? "Recuperar senha" : register ? "Crie sua conta" : "Entre na sua conta"}</h2>
      {!pendingLink && <p>{reset ? "Enviaremos um link para você criar uma nova senha." : "Acesse com sua conta preferida ou use seu e-mail."}</p>}
      {!auth && <div className="auth-notice" role="status">Configure as variáveis VITE_FIREBASE no arquivo .env.local para habilitar a autenticação.</div>}
      {error && <div className="auth-error" role="alert">{error}</div>}
      {message && <div className="auth-notice" role="status">{message}</div>}
      {pendingLink ? <LinkingStep email={pendingLink.email} authenticated={Boolean(user)} busy={busy} passwordMode={passwordMode}
        onProvider={id => run(() => socialLogin(id))}
        onConfirm={() => run(() => finishLink({ user }))}
        onPassword={() => setPasswordMode(value => !value)}
        onCancel={() => { setPendingLink(null); setPasswordMode(false); setError(""); }}>
        {emailForm}
      </LinkingStep> : <>
        {!reset && <><Providers disabled={busy || !auth} onSelect={id => run(() => socialLogin(id))} /><div className="auth-divider">ou continue com e-mail</div></>}
        {emailForm}
      </>}
      {!pendingLink && <p className="auth-switch">{reset ? <Link to="/login">Voltar para o login</Link> : register ? <>Já tem uma conta? <Link to="/login">Entrar</Link></> : <>Ainda não tem conta? <Link to="/register">Cadastre-se</Link></>}</p>}
    </div></section>
  </main>;
}


