import { Link } from "react-router-dom";
import { ArrowUpRight, FileCode2 } from "lucide-react";
import Tag from "../ui/SeverityTag";
import { date } from "../../utils/security";
import "./SeverityFilesList.css";

export default function SeverityFilesList({
  severity,
  alerts = [],
  analyses = [],
  onSelect,
}) {
  const seen = new Set();
  const records = alerts
    .filter((item) => item.severity === severity)
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    .filter((item) => {
      const key = `${item.repository_id || item.repository}::${item.file}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  return (
    <div className="severity-file-list">
      {records.length ? (
        records.map((item) => {
          const analysis = analyses.find(
            (a) => a.repository_id === item.repository_id,
          );
          const content = (
            <>
              <span className="severity-file-icon">
                <FileCode2 size={17} />
              </span>
              <span className="severity-file-project">
                <b>{item.repository}</b>
                <small>{item.file}</small>
              </span>
              <Tag name={item.severity} />
              <time dateTime={item.created_at}>{date(item.created_at)}</time>
              {analysis && (
                <ArrowUpRight size={16} className="severity-file-arrow" />
              )}
            </>
          );
          return analysis ? (
            <Link
              className="severity-file-row"
              to={
                "/analysis/" +
                analysis.id +
                "?file=" +
                encodeURIComponent(item.file)
              }
              onClick={onSelect}
              key={item.id}
            >
              {content}
            </Link>
          ) : (
            <div className="severity-file-row" key={item.id}>
              {content}
            </div>
          );
        })
      ) : (
        <p className="metric-no-results">
          Nenhum arquivo com esta severidade nos dados disponíveis.
        </p>
      )}
      <p className="metric-data-note">
        Um arquivo aparece apenas uma vez por projeto, considerando sua
        ocorrência mais recente. A lista mostra os arquivos disponíveis nos
        resultados.
      </p>
    </div>
  );
}
