import { Github, FolderGit2, Info } from "lucide-react";
import Layout from "../../components/layout/AppLayout";
import GitHubSource from "../../components/repositories/GitHubSource";
import "./Repositories.css";
export default function Repositories(){
return <Layout><main className="container page repositories-page">
<div className="page-heading"><div><h1>Repositórios</h1><p>Gerencie os projetos e acompanhe suas verificações de segurança.</p></div></div>
<section className="panel connected-repos"><div className="panel-head"><div><h2>Repositórios conectados</h2><p>Projetos associados à sua conta GitHub.</p></div></div>
<div className="repos-empty"><FolderGit2 size={26}/><b>Nenhum repositório conectado</b><p>A integração com o GitHub ainda depende de autenticação e dos endpoints de repositórios no backend.</p></div></section>
<section className="panel repository-connect"><div className="panel-head"><div><h2>Conectar repositório</h2><p>Informe o projeto que deseja acompanhar.</p></div></div><GitHubSource/></section>
<div className="feature-note"><Info size={16}/><span>O endereço GitHub pode ser validado, mas conectar um repositório e executar análises automaticamente ainda requer integração no backend.</span></div>
</main></Layout>}
