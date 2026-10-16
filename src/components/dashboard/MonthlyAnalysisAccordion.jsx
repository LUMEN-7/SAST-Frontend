import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronDown, ClipboardList } from "lucide-react";
import { date } from "../../utils/security";
import "./MonthlyAnalysisAccordion.css";

export default function MonthlyAnalysisAccordion({ analyses, onSelect }) {
  const groups = new Map();
  for (const analysis of analyses) {
    const raw = analysis.created_at || analysis.at;
    const parsed = raw ? new Date(raw) : null;
    const valid = parsed && !Number.isNaN(parsed.getTime());
    const key = valid
      ? `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}`
      : "unknown";
    const label = valid
      ? new Intl.DateTimeFormat("pt-BR", {
          month: "long",
          year: "numeric",
        }).format(parsed)
      : "Data não informada";
    if (!groups.has(key)) groups.set(key, { key, label, rows: [] });
    groups.get(key).rows.push(analysis);
  }
  const months = [...groups.values()].sort((a, b) =>
    b.key.localeCompare(a.key),
  );
  return (
    <div className="monthly-analyses">
      {months.map((month, index) => (
        <details className="monthly-group" key={month.key} open={index === 0}>
          <summary>
            <span>
              <strong>{month.label}</strong>
              <small>
                {month.rows.length}{" "}
                {month.rows.length === 1 ? "análise" : "análises"}
              </small>
            </span>
            <ChevronDown size={18} />
          </summary>
          <div className="monthly-group-list">
            {month.rows.map((a) => (
              <Link
                key={a.id}
                to={"/analysis/" + a.id}
                onClick={onSelect}
                className="metric-project"
              >
                <span className="metric-project-icon">
                  <ClipboardList size={17} />
                </span>
                <span className="metric-project-name">
                  <b>{a.repo_name || a.name || a.id}</b>
                  <small>
                    {date(a.created_at || a.at)} ·{" "}
                    {a.commit || "Análise registrada"}
                  </small>
                </span>
                <span className="metric-project-count">Ver análise</span>
                <ArrowUpRight size={16} />
              </Link>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
