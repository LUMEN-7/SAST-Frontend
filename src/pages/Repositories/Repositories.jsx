import { useEffect, useState } from "react";
import {
  Github,
  GitBranch,
  FolderGit2,
  Search,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "../../components/layout/AppLayout";
import GitHubSource from "../../components/repositories/GitHubSource";
import { sastService } from "../../services/sastService";
import { severity } from "../../utils/security";
import "./Repositories.css";

export default function Repositories() {
  const [repos, setRepos] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [analyses, setAnalyses] = useState([]),
    [query, setQuery] = useState("");
  useEffect(() => {
    let active = true;
    Promise.all([sastService.getRepositories(), sastService.getAnalyses()])
      .then(([items, jobs]) => {
        if (active) {
          setRepos(items);
          setAnalyses(jobs);
        }
      })
      .catch(err => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => {
      active = false;
    };
  }, []);
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
        </div>
        <section className="panel repository-connect">
          <div className="panel-head">
            <div>
              <h2>Conectar repositório</h2>
              <p>Configure um projeto para acompanhar suas verificações.</p>
            </div>
          </div>
          <GitHubSource />
        </section>
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
                const related = analyses
                  .filter((a) => a.repository_id === repo.id)
                  .sort(
                    (a, b) =>
                      new Date(b.created_at || 0) - new Date(a.created_at || 0),
                  );
                const job = related[0];
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
                      {severity(repo.risk).label}
                    </span>
                    <div className="repo-count">
                      <b>{repo.findings}</b>
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
              <Github size={25} />
              <b>Nenhum repositório encontrado</b>
              <p>
                {query
                  ? "Tente outro termo."
                  : "A integração ainda não retornou repositórios."}
              </p>
            </div>
          )}
        </section>
      </main>
    </Layout>
  );
}
