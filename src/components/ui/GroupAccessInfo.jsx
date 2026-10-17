import { Mail } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";

export default function GroupAccessInfo({disabled=false,onCheck}) {
  const {user} = useAuth();
  return <section className="panel group-form group-join">
    <h2><Mail size={18}/>Já possui um grupo?</h2>
    <p>Peça ao administrador para adicionar o e-mail da sua conta.</p>
    <label>Seu e-mail<input value={user?.email || ""} readOnly type="email" autoComplete="email"/></label>
    <p className="group-join-help">Depois que o administrador adicionar você, o grupo aparecerá em “Meus grupos”.</p>
    <button className="btn btn-outline" type="button" disabled={disabled} onClick={onCheck}>Ver meus grupos</button>
  </section>;
}
