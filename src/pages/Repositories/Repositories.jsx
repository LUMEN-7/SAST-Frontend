import GitHubIcon from "../../components/ui/GitHubIcon";
import { useEffect, useState } from "react";
import {
  Plus,
  FolderGit2,
  Search,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "../../components/layout/AppLayout";
import AddRepository from "../../components/repositories/AddRepository";
import { api } from "../../api";
import { severity } from "../../utils/security";
import { repositoryError, protectionWarning } from "../../services/repositoryConfig";
import "./Repositories.css";

export default function Repositories() {
  const [repos, setRepos] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [adding, setAdding] = useState(false),
    [refresh, setRefresh] = useState(0),
    [notice, setNotice] = useState(""),
    [query, setQuery] = useState("");
  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    api.repos()
      .then(data => {
        if (active) {
          setRepos(Array.isArray(data) ? data : data.repos || []);
        }
      })
      .catch(err => { if (active) setError(repositoryError(err)); })
      .finally(() => { if (active) setLoading(false); });
    return () => {
      active = false;
    };
  }, [refresh]);
  const filtered = repos.filter((repo) =>
    [repo.full_name, repo.branch, repo.language]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <Layout>
      <main className="container page repositories-page">
        <div className="page-heading">
          <div>
            <h1>Repositórios</h1>
            <p>Projetos acompanhados pela plataforma.</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => setAdding(true)}><Plus size={17} /> Adicionar</button>
        </div>
        {adding && <AddRepository onClose={() => setAdding(false)} onConnected={result => { setAdding(false); setNotice(["Repositório conectado.", protectionWarning(result), result?.manualCheck].filter(Boolean).join(" ")); setRefresh(value => value + 1); }} />}
        {notice && <div className="repo-config-warning" role="status">{notice}</div>}
        <section className="panel connected-repositories">
          <div className="panel-head">
            <div>
              <h2>Repositórios conectados</h2>
              <p>{repos.length} projetos disponíveis</p>
            </div>
            <label className="repository-search">
              <Search size={16} />
              <input
                aria-label="Buscar repositórios"
                placeholder="Buscar repositório..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
          </div>
          {loading ? <div className="ares-repos-loading" role="status" aria-label="Carregando repositórios">{Array.from({length:4},(_,i)=><div className="ares-repos-placeholder" key={i}><div className="ares-skeleton" style={{width:"42%"}}/><div className="ares-skeleton" style={{width:"18%"}}/><div className="ares-skeleton" style={{width:"12%"}}/></div>)}</div> : error ? <div role="alert" className="notice error">{error}</div> : filtered.length ? (
            <div className="repo-list">
              <div className="repo-list-heading">
                <span>REPOSITÓRIO</span>
                <span>RISCO</span>
                <span>ACHADOS</span>
                <span></span>
              </div>
              {filtered.map((repo) => {
                return (
                  <div className="repo-item" key={repo.id}>
                    <span className="repo-symbol">
                      <FolderGit2 size={19} />
                    </span>
                    <div className="repo-info">
                      <Link
                        to={"/repositories/" + encodeURIComponent(repo.id)}
                        className="repo-name-link"
                      >
                        {repo.full_name}
                      </Link>
                      <small>{repo.branch ? "branch: " + repo.branch + " · " : ""}{repo.language}</small>
                    </div>
                    <span className={"repo-risk risk-" + repo.risk}>
                      {repo.risk ? severity(repo.risk).label : "Sem avaliação"}
                    </span>
                    <div className="repo-count">
                      <b>{repo.findings ?? "—"}</b>
                      <small>achados</small>
                    </div>
                    {
                      <Link
                        className="repo-open"
                        aria-label={"Abrir dashboard de " + repo.full_name}
                        to={"/repositories/" + encodeURIComponent(repo.id)}
                      >
                        <ArrowUpRight size={17} />
                      </Link>
                    }
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="repos-empty">
              <GitHubIcon size={25} />
              <b>{query ? "Nenhum repositório encontrado" : "Nenhum repositório conectado"}</b>
              <p>
                {query
                  ? "Tente outro termo."
                  : "Clique em Adicionar para conectar seu primeiro repositório."}
              </p>
            </div>
          )}
        </section>
      </main>
    </Layout>
  );
}
