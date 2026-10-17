import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "firebase/auth";
import { ArrowRight, Users } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { authError } from "../../auth/errors";
import { api } from "../../api";
import Brand from "../../components/layout/Brand";
import ThemeToggle from "../../components/layout/ThemeToggle";
import GroupAccessInfo from "../../components/ui/GroupAccessInfo";
import "../Groups/Groups.css";
import "./Onboarding.css";

export default function Onboarding() {
  const {user,finishOnboarding} = useAuth();
  const navigate = useNavigate();
  const [name,setName] = useState(user.displayName || "");
  const [groupName,setGroupName] = useState("");
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");
  const [nameSaved,setNameSaved] = useState(false);
  const [created,setCreated] = useState(false);
  const [step,setStep] = useState("name");
  function finish(path="/") { finishOnboarding(); navigate(path,{replace:true}); }
  async function saveName(event) {
    event.preventDefault();
    if (busy || !name.trim()) return;
    setBusy(true);setError("");
    try { await updateProfile(user,{displayName:name.trim()}); setNameSaved(true);setStep("group"); }
    catch(e) { setError(authError(e)); }
    finally { setBusy(false); }
  }
  async function create(event) {
    event.preventDefault();
    if (busy || !groupName.trim()) return;
    setBusy(true);setError("");
    try { await api.createGroup(groupName.trim()); setCreated(true); }
    catch(e) { setError(e.message || "Não foi possível criar o grupo."); }
    finally { setBusy(false); }
  }
  return <main className="onboarding-page groups-page">
    <header className="onboarding-header"><Brand/><ThemeToggle/></header>
    <div className={"onboarding-content onboarding-step-"+step}>
    <span className="section-kicker">PRIMEIRO ACESSO · {step==="name"?"1 DE 2":"2 DE 2"}</span>
    {step==="name" ? <><h1>Como você quer ser chamado?</h1><p>Esse nome aparece no seu perfil. Você pode alterá-lo depois.</p>
    <form className="onboarding-name" onSubmit={saveName}><label htmlFor="onboarding-name">Nome de exibição<input id="onboarding-name" autoComplete="nickname" maxLength={100} value={name} onChange={e=>setName(e.target.value)} required disabled={busy}/></label><div className="onboarding-name-actions"><button type="button" className="onboarding-skip" disabled={busy} onClick={()=>{setError("");setStep("group");}}>Agora não</button><button className="btn btn-primary" disabled={busy || !name.trim()}>{busy?"Salvando…":"Continuar"}<ArrowRight size={16}/></button></div></form></> :
    <><h1>{created?"Grupo criado":"Como você quer começar?"}</h1><p>{created?"Você já pode administrar os acessos e repositórios da equipe.":"Receba acesso por e-mail, crie um grupo ou continue por conta própria."}</p>
    {created ? <section className="panel onboarding-created" role="status"><Users size={24}/><h2>{groupName.trim()}</h2><p>Seu papel: administrador.</p><button className="btn btn-primary" onClick={()=>finish("/groups")}>Administrar grupo<ArrowRight size={16}/></button></section> :
    <><div className="onboarding-options"><GroupAccessInfo disabled={busy} onCheck={()=>finish("/groups")}/><form className="panel group-form" onSubmit={create}><h2><Users size={18}/>Crie um grupo e o administre</h2><p>Reúna os repositórios e gerencie os acessos da equipe.</p><label htmlFor="onboarding-group">Nome do grupo<input id="onboarding-group" placeholder="Ex.: LUMEN" value={groupName} onChange={e=>setGroupName(e.target.value)} required disabled={busy}/></label><button className="btn btn-primary" disabled={busy || !groupName.trim()}>{busy?"Criando…":"Criar grupo"}</button></form></div>
    <div className="onboarding-footer"><button className="onboarding-skip" disabled={busy} onClick={()=>{setStep("name");setError("");}}>Voltar</button><button className="onboarding-skip" disabled={busy} onClick={()=>finish()}>Pular por enquanto<ArrowRight size={16}/></button></div></>}
    </>}
    {nameSaved && step==="group" && <p className="onboarding-saved">Nome de exibição salvo.</p>}
    {error && <div className="notice error" role="alert">{error}</div>}
    </div>
  </main>;
}
