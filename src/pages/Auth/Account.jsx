import { useState } from "react";
import { Link } from "react-router-dom";
import { linkWithPopup, sendPasswordResetEmail, sendEmailVerification, updateProfile } from "firebase/auth";
import { UserRound, ShieldCheck, Mail, FileCode2, LogOut } from "lucide-react";
import Layout from "../../components/layout/AppLayout";
import { auth } from "../../firebase";
import { useAuth } from "../../auth/AuthContext";
import { authError } from "../../auth/errors";
import { Providers, providerFor } from "./Auth";
import "./Account.css";
export default function Account() {
  const { user, logout } = useAuth();
  const [linked, setLinked] = useState(() => user.providerData.map(p => p.providerId));
  const [name, setName] = useState(user.displayName || "");
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [message, setMessage] = useState("");
  async function run(action) {
    setBusy(true); setError(""); setMessage("");
    try { await action(); } catch (err) { setError(authError(err)); } finally { setBusy(false); }
  }
  const created = user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString("pt-BR") : "—";
  return <Layout><main className="container page profile-page">
    <div className="page-heading"><div><span className="section-kicker">SUA CONTA</span><h1>Meu perfil</h1><p>Gerencie sua identidade, seus acessos e a privacidade das suas análises.</p></div></div>
    <section className="profile-hero"><div className="profile-avatar" aria-hidden="true">{(user.displayName || user.email || "U").slice(0, 1).toUpperCase()}</div><div><h2>{user.displayName || "Bem-vindo à Lumen"}</h2><p>{user.email}</p><span><ShieldCheck size={14} />{user.emailVerified ? "E-mail verificado" : "E-mail ainda não verificado"}</span></div><small>Membro desde {created}</small></section>
    {error && <div className="auth-error" role="alert">{error}</div>}{message && <div className="auth-notice" role="status">{message}</div>}
    <div className="profile-grid"><section className="panel auth-card"><h2><UserRound size={19} /> Informações pessoais</h2><p>Escolha como seu nome aparece na plataforma.</p><form onSubmit={event => { event.preventDefault(); run(async () => { await updateProfile(user, { displayName: name.trim() }); setMessage("Perfil atualizado."); }); }}><label>Nome de exibição<input name="name" value={name} onChange={event => setName(event.target.value)} required maxLength={100} disabled={busy} /></label><label>E-mail<input value={user.email || ""} readOnly type="email" /></label><button className="auth-submit" disabled={busy || !name.trim() || name.trim() === (user.displayName || "")}>Salvar alterações</button></form></section>
    <section className="panel auth-card"><h2><ShieldCheck size={19} /> Métodos de acesso</h2><p>Vincule Google e GitHub para entrar na mesma conta por qualquer um deles.</p><Providers disabled={busy} linked={linked} onSelect={id => run(async () => { await linkWithPopup(user, providerFor(id)); setLinked(user.providerData.map(p => p.providerId)); setMessage("Conta vinculada. Você já pode entrar por esse provedor."); })} /><div className="profile-method"><Mail size={16} /><span>E-mail e senha</span><b>{linked.includes("password") ? "Ativo" : "Não configurado"}</b></div>{linked.includes("password") && <button type="button" className="auth-secondary" disabled={busy} onClick={() => run(async () => { await sendPasswordResetEmail(auth, user.email); setMessage("Enviamos as instruções para alterar sua senha."); })}>Alterar senha por e-mail</button>}{!user.emailVerified && <button type="button" className="auth-secondary" disabled={busy} onClick={() => run(async () => { await sendEmailVerification(user); setMessage("Enviamos um link para verificar seu e-mail."); })}>Verificar meu e-mail</button>}</section>
    <section className="panel profile-private"><FileCode2 size={24} /><h2>Seu código, no seu navegador</h2><p>Na área local, arquivos e resultados ficam apenas na memória da página. Não são enviados à API, ao Firebase ou a terceiros e não entram no histórico da conta.</p><Link to="/local-analyses" className="btn btn-primary">Abrir análises locais</Link></section>
    <section className="panel profile-session"><h2>Sessão e privacidade</h2><p>Ao sair, os dados locais e o cache do aplicativo são limpos, incluindo o histórico deste navegador. Seus vínculos de Google e GitHub são mantidos.</p><button type="button" className="btn btn-outline" disabled={busy} onClick={() => run(logout)}><LogOut size={16} /> Sair da conta</button></section></div>
  </main></Layout>;
}
