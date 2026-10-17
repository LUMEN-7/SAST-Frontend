import { useEffect, useState } from "react";
import { Bell, ShieldAlert } from "lucide-react";
import Layout from "../../components/layout/AppLayout";
import Empty from "../../components/ui/EmptyState";
import { severity } from "../../utils/security";
import { sastService } from "../../services/sastService";
import { date } from "../../utils/security";
import "./Alerts.css";
export default function Alerts() {
  const [alerts, setAlerts] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [filter, setFilter] = useState("all");
  useEffect(() => {
    let active = true;
    sastService.getAlerts().then(items => { if (active) setAlerts(items); })
      .catch(err => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const visible = alerts.filter(
    (a) => filter === "all" || a.severity === filter,
  );
  return (
    <Layout>
      <main className="container page alerts-page">
        <div className="page-heading">
          <div>
            <h1>Alertas</h1>
            <p>Ocorrências de segurança dos repositórios monitorados.</p>
          </div>
        </div>
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>Alertas de segurança</h2>
              <p>{alerts.length} eventos registrados</p>
            </div>
            <select
              className="alert-filter"
              aria-label="Filtrar severidade"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Todas as severidades</option>
              <option value="critical">Crítica</option>
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="low">Baixa</option>
            </select>
          </div>
          {loading ? <p role="status">Carregando alertas…</p> : error ? <div role="alert" className="notice error">{error}</div> : visible.length ? (
            <div className="alert-list">
              {visible.map((a) => (
                <article className="alert-item" key={a.id}>
                  <span
                    className={"alert-symbol alert-symbol-" + a.severity}
                    title={"Severidade: " + severity(a.severity).label}
                    aria-label={"Severidade: " + severity(a.severity).label}
                  >
                    <ShieldAlert size={19} />
                  </span>
                  <div className="alert-info">
                    <div className="alert-line">
                      <b>{a.title}</b>
                    </div>
                    <p>{a.description}</p>
                    <small>
                      {a.repository} · {a.file} · {date(a.created_at)}
                    </small>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <Empty icon={Bell} title="Nenhum alerta encontrado">
              Não há alertas para o filtro selecionado.
            </Empty>
          )}
        </section>
      </main>
    </Layout>
  );
}
