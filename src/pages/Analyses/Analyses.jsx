import { useEffect, useMemo, useState } from "react";
import { Search, ClipboardList } from "lucide-react";
import Layout from "../../components/layout/AppLayout";
import Empty from "../../components/ui/EmptyState";
import { sastService, isDemo } from "../../services/sastService";
import RepositoryAnalysisAccordion from "../../components/analysis/RepositoryAnalysisAccordion";
import AnalysisLegend from "../../components/analysis/AnalysisLegend";
import "./Analyses.css";

export default function Analyses() {
  const [items, setItems] = useState([]),
    [query, setQuery] = useState(""),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    sastService
      .getAnalysisHistory()
      .then((rows) => {
        if (active) setItems(rows);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const groups = useMemo(() => {
    const grouped = new Map();
    for (const item of items) {
      const name = item.repo_name || item.name || "Repositório não informado";
      const key = item.repository_id || name;
      if (!grouped.has(key)) grouped.set(key, { id: key, name, analyses: [] });
      grouped.get(key).analyses.push(item);
    }
    return [...grouped.values()]
      .map((g) => ({
        ...g,
        analyses: g.analyses.sort(
          (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
        ),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);
  const filtered = groups
    .map((g) => ({
      ...g,
      analyses: g.analyses.filter((a) =>
        [g.name, a.id, a.commit, a.status, a.created_at]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    }))
    .filter((g) => g.analyses.length);
  return (
    <Layout>
      <main className="container page analyses-page">
        <div className="page-heading">
          <div>
            <h1>Análises</h1>
            <p>Histórico de verificações de segurança por repositório.</p>
          </div>
          {isDemo && (
            <span className="neutral-pill">DADOS DE DEMONSTRAÇÃO</span>
          )}
        </div>
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Execuções</h2>
              <p>
                {items.length} análises em {groups.length} repositórios
              </p>
            </div>
          </div>
          <label className="search-field analyses-search">
            <Search size={16} />
            <input
              aria-label="Buscar análises"
              placeholder="Buscar por repositório, commit ou ID"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <AnalysisLegend />
          {error ? (
            <div role="alert" className="notice error">
              {error}
            </div>
          ) : loading ? (
            <p className="analyses-feedback">Carregando análises...</p>
          ) : filtered.length ? (
            <RepositoryAnalysisAccordion groups={filtered} />
          ) : (
            <Empty icon={ClipboardList} title="Nenhuma execução encontrada">
              Altere sua busca ou aguarde novas análises.
            </Empty>
          )}
        </section>
      </main>
    </Layout>
  );
}
