import { useEffect } from "react";
import { Link } from "react-router-dom";
import { X, ArrowUpRight, ShieldAlert, ClipboardList } from "lucide-react";
import { date, severity } from "../../utils/security";
import Tag from "../ui/SeverityTag";
import MonthlyAnalysisAccordion from "./MonthlyAnalysisAccordion";
import ProjectFindingsAccordion from "./ProjectFindingsAccordion";
import SeverityFilesList from "./SeverityFilesList";
import "./MetricDetailsModal.css";

const config = {
  analyses: ["Análises realizadas", "Execuções recentes e seus resultados"],
  findings: [
    "Vulnerabilidades",
    "Achados agrupados por projeto e arquivos identificados",
  ],
  critical: ["Riscos críticos", "Projetos com vulnerabilidades críticas"],
  high: ["Riscos altos", "Projetos com vulnerabilidades de alta severidade"],
};
export default function MetricDetailsModal({
  type,
  onClose,
  analyses = [],
  alerts = [],
  summary,
}) {
  useEffect(() => {
    if (!type) return;
    const handle = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [type, onClose]);
  if (!type) return null;
  const [title, subtitle] = config[type] || config.findings;
  const rows = analyses.filter(
    (a) =>
      type === "analyses" || type === "findings" || Number(a[type] || 0) > 0,
  );
  const matchingAlerts = alerts.filter(
    (a) => type === "findings" || a.severity === type,
  );
  return (
    <div
      className="metric-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="metric-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="metric-title"
      >
        <div className="metric-dialog-header">
          <div>
            <span className="metric-eyebrow">
              VISÃO DETALHADA
            </span>
            <h2 id="metric-title">{title}</h2>
            <p>{subtitle}</p>
          </div>
          <button
            className="metric-close"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={19} />
          </button>
        </div>
        <div className="metric-dialog-content">
          {type === "findings" ? (
            <ProjectFindingsAccordion
              analyses={rows}
              alerts={alerts}
              onSelect={onClose}
            />
          ) : type === "analyses" ? (
            rows.length ? (
              <MonthlyAnalysisAccordion analyses={rows} onSelect={onClose} />
            ) : (
              <p className="metric-no-results">Nenhuma análise disponível.</p>
            )
          ) : (
            <SeverityFilesList
              severity={type}
              alerts={alerts}
              analyses={analyses}
              onSelect={onClose}
            />
          )}
        </div>
        <div className="metric-dialog-footer">
          <button onClick={onClose} className="btn btn-outline">
            Fechar
          </button>
          <Link className="btn btn-primary" to="/analyses" onClick={onClose}>
            Todas as análises <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}
