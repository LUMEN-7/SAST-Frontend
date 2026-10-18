import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Link,
  NavLink,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import {
  Activity,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CloudUpload,
  Code2,
  ExternalLink,
  FileArchive,
  FileCode2,
  FolderGit2,
  Github,
  GitBranch,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Terminal,
  TriangleAlert,
  UploadCloud,
  X,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { api, readRecent, saveRecent } from "../../api";
import { date, severity } from "../../utils/security";
import Layout from "../../components/layout/AppLayout";
import Status from "../../components/ui/AnalysisStatus";
import Empty from "../../components/ui/EmptyState";
import ScanFindingsTable from "../../components/analysis/ScanFindingsTable";
import "./Analysis.css";
function Analysis() {
  const { id } = useParams(),
    [status, setStatus] = useState(null),
    [result, setResult] = useState(null),
    [gate, setGate] = useState(null),
    [error, setError] = useState(""),
    [filter, setFilter] = useState("all"),
    [search, setSearch] = useState(""),
    [threshold, setThreshold] = useState("high"),
    [reporting, setReporting] = useState(false);
  const queryFile = new URLSearchParams(useLocation().search).get("file");
  useEffect(() => {
    if (queryFile) setSearch(queryFile);
  }, [queryFile]);
  const recent = readRecent().find((x) => x.id === id);
  useEffect(() => {
    let active = true,
      interval;
    async function refresh() {
      try {
        const s = await api.status(id);
        if (!active) return;
        setStatus(s);
        if (s.status === "failed") {
          setError(s.error_message || "A análise falhou.");
          clearInterval(interval);
          return;
        }
        if (s.status === "completed") {
          saveRecent({
            id,
            name: s.repo_name || recent?.name || "análise",
            status: s.status,
            repository_id: s.repository_id || recent?.repository_id || null,
          });
          try {
            const r = await api.result(id);
            if (active) setResult(r);
          } catch (e) {
            if (active) setError(e.message);
          }
          clearInterval(interval);
        }
      } catch (e) {
        if (active) {
          setError(e.message);
          clearInterval(interval);
        }
      }
    }
    refresh();
    interval = setInterval(refresh, 3500);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [id]);
  useEffect(() => {
    let live = true;
    api
      .gate(id, threshold)
      .then((x) => {
        if (live) setGate(x);
      })
      .catch(() => {
        if (live) setGate(null);
      });
    return () => {
      live = false;
    };
  }, [id, threshold, status?.status]);
  const findings = useMemo(
    () =>
      [...(result?.findings || [])]
        .filter(
          (x) =>
            (filter === "all" ||
              String(x.ai_severity || x.severity).toLowerCase() === filter) &&
            [x.message, x.file_path, x.rule_id, x.tool]
              .join(" ")
              .toLowerCase()
              .includes(search.toLowerCase()),
        )
        .sort(
          (a, b) =>
            severity(b.ai_severity || b.severity).rank -
            severity(a.ai_severity || a.severity).rank,
        ),
    [result, filter, search],
  );
  async function download() {
    setReporting(true);
    try {
      const md = await api.report(id),
        blob = new Blob([md], { type: "text/markdown;charset=utf-8" }),
        url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = "sast-report-" + id.slice(0, 8) + ".md";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    } finally {
      setReporting(false);
    }
  }
  return (
    <Layout dashboard>
      <main className="container page analysis">
        <Link to="/dashboard" className="back-link">
          <ArrowLeft size={15} /> Voltar ao dashboard
        </Link>
        <div className="page-heading">
          <div>
            <span className="section-kicker">
              RESULTADO / INSPEÇÃO DE CÓDIGO
            </span>
            <h1>
              {recent?.repo_name || recent?.name || "Análise " + id.slice(0, 8)}

            </h1>
            <p>
              Identificador <code className="mono">{id}</code>
            </p>
          </div>
          <button
            onClick={download}
            disabled={reporting}
            className="btn btn-outline"
          >
            <ArrowDownToLine size={17} />
            {reporting ? "Gerando…" : "Baixar relatório"}
          </button>
        </div>
        {error && (
          <div role="alert" className="notice error">
            {error}
          </div>
        )}
        <div className="scan-meta">
          <div>
            <span>STATUS</span>
            <Status value={status?.status || "pending"} />
          </div>
          <div>
            <span>INICIADA EM</span>
            <b>{date(status?.created_at)}</b>
          </div>
          <div>
            <span>FINALIZADA EM</span>
            <b>{date(status?.finished_at)}</b>
          </div>
          <div>
            <span>ORIGEM</span>
            <b>{status?.source || result?.source || "Não informada"}</b>
          </div>
        </div>
        {status?.error_message && (
          <div className="notice error">
            Erro da análise: {status.error_message}
          </div>
        )}
        {!error && !["completed", "failed"].includes(status?.status) && (
          <div className="processing">
            <div className="spinner" />
            <div>
              <b>Análise em andamento</b>
              <p>
                Consultando o processamento automaticamente a cada poucos
                segundos. Esta página pode ser mantida aberta.
              </p>
            </div>
          </div>
        )}
        <section className="panel gate-panel">
          <div className="panel-head">
            <div>
              <h2>Security gate</h2>
              <p>Verificação automática do nível de risco aceito</p>
            </div>
            <select
              aria-label="Limiar do security gate"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
            >
              {["critical", "high", "medium", "low", "info"].map((x) => (
                <option value={x} key={x}>
                  Limite: {severity(x).label}
                </option>
              ))}
            </select>
          </div>
          <div className="gate-content">
            <div
              className={
                "gate-icon " + (gate?.gate === "pass" ? "pass" : "fail")
              }
            >
              {gate?.gate === "pass" ? (
                <ShieldCheck size={25} />
              ) : gate?.gate === "fail" ? (
                <ShieldAlert size={25} />
              ) : (
                <Clock3 size={25} />
              )}
            </div>
            <div>
              <b>
                {gate?.gate === "pass"
                  ? "Verificação aprovada"
                  : gate?.gate === "fail"
                    ? "Verificação reprovada"
                    : "Aguardando avaliação"}
              </b>
              <p>
                {gate?.gate === "fail"
                  ? gate.blocking_findings +
                    " vulnerabilidade(s) bloqueiam a aprovação."
                  : gate?.gate === "pass"
                    ? "Nenhuma vulnerabilidade excede o limiar configurado."
                    : "O resultado depende do status da análise."}
              </p>
            </div>
          </div>
        </section>
        <ScanFindingsTable findings={result?.findings || []} analysisId={id} queryFile={queryFile || ""} busy={!result && !error && status?.status !== "failed"} />
        <div className="analysis-bottom">
          <Link className="btn btn-primary" to="/">
            Voltar ao painel <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    </Layout>
  );
}
export default Analysis;
