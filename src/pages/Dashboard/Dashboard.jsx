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
import { readRecent } from "../../api";
import {sastService,isDemo} from "../../services/sastService";
import { date, severity } from "../../utils/security";
import Layout from "../../components/layout/AppLayout";
import Stat from "../../components/dashboard/StatCard";
import Tag from "../../components/ui/SeverityTag";
import Status from "../../components/ui/AnalysisStatus";
import Empty from "../../components/ui/EmptyState";
import "./Dashboard.css";
function Dashboard() {
  const [summary, setSummary] = useState(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [recent, setRecent] = useState(readRecent());
  const load = useCallback(async () => {
    try {
      setSummary(await sastService.getSummary());
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRecent(readRecent());
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  const dist = Object.entries(summary?.severity_distribution || {})
    .map(([key, value]) => ({ name: severity(key).label, key, value }))
    .sort((a, b) => severity(b.key).rank - severity(a.key).rank);
  const trend = summary?.trend_last_7_days || [];
  const [demoAnalyses,setDemoAnalyses]=useState([]);
  useEffect(()=>{sastService.getAnalyses().then(setDemoAnalyses)},[]);
  const displayedRecent=isDemo?demoAnalyses:recent;
  return (
    <Layout dashboard>
      <main className="container page dashboard">
        <div className="page-heading">
          <div>
            <h1>Visão geral</h1>{isDemo&&<span className="neutral-pill">DADOS DE DEMONSTRAÇÃO</span>}
            <p>Acompanhe os resultados das análises dos seus projetos.</p>
          </div>
          <button
            className="btn btn-outline"
            onClick={() => {
              setLoading(true);
              load();
            }}
          >
            <Activity size={16} /> Atualizar
          </button>
        </div>
        {error && (
          <div role="alert" className="notice error">
            Não foi possível carregar os dados do backend: {error}
          </div>
        )}
        <div className="stat-grid">
          <Stat
            label="Análises realizadas"
            value={summary?.total_jobs ?? (loading ? "…" : "—")}
            icon={FolderGit2}
            note="Total registrado na API"
          />
          <Stat
            label="Vulnerabilidades"
            value={summary?.total_findings ?? (loading ? "…" : "—")}
            icon={ShieldAlert}
            note="Achados em todas as análises"
          />
          <Stat
            label="Riscos críticos"
            value={
              summary?.severity_distribution?.critical ?? (loading ? "…" : "—")
            }
            icon={TriangleAlert}
            note="Severidade crítica"
          />
          <Stat
            label="Riscos altos"
            value={
              summary?.severity_distribution?.high ?? (loading ? "…" : "—")
            }
            icon={Activity}
            note="Severidade alta"
          />
        </div>
        <div className="dashboard-grid">
          <section className="panel panel-wide">
            <div className="panel-head">
              <div>
                <h2>Evolução das vulnerabilidades</h2>
                <p>Achados encontrados nos últimos 7 dias</p>
              </div>
              <span className="neutral-pill">7 dias</span>
            </div>
            {trend.length ? (
              <div className="chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend}>
                    <defs>
                      <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="#76e0c3"
                          stopOpacity=".28"
                        />
                        <stop
                          offset="95%"
                          stopColor="#76e0c3"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      vertical={false}
                      stroke="#253344"
                      strokeDasharray="4 5"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#8291a7", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "#8291a7", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#152233",
                        border: "1px solid #34445b",
                        borderRadius: 12,
                        color: "#e6f2f2",
                      }}
                    />
                    <Area
                      dataKey="findings"
                      name="Vulnerabilidades"
                      type="monotone"
                      stroke="#76e0c3"
                      strokeWidth={3}
                      fill="url(#area)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <Empty icon={Activity} title="Sem dados de tendência">
                As análises realizadas aparecerão aqui.
              </Empty>
            )}
          </section>
          <section className="panel">
            <div className="panel-head">
              <div>
                <h2>Distribuição de risco</h2>
                <p>Por nível de severidade</p>
              </div>
            </div>
            {dist.length ? (
              <div className="severity-bars">
                {dist.map((item) => (
                  <div className="bar-line" key={item.key}>
                    <div>
                      <Tag name={item.key} />
                      <b>{item.value}</b>
                    </div>
                    <span className="bar-track">
                      <span
                        style={{
                          width:
                            (item.value /
                              Math.max(...dist.map((x) => x.value), 1)) *
                              100 +
                            "%",
                          background: severity(item.key).color,
                        }}
                      />
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <Empty title="Nenhum risco registrado">
                Os achados aparecerão aqui quando houver análises.
              </Empty>
            )}
          </section>
        </div>
        <div className="dashboard-grid attention-recent-grid">
          <section className="panel">
            <div className="panel-head">
              <div>
                <h2>Arquivos que exigem atenção</h2>
                <p>
                  Arquivos com maior concentração de riscos altos e críticos
                </p>
              </div>
            </div>
            {summary?.top_critical_files?.length ? (
              <div className="critical-files">
                {summary.top_critical_files.map((f, i) => (
                  <div className="critical-file" key={f.file_path}>
                    <span className="file-index">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <FileCode2 size={17} />
                    <span className="file-name">{f.file_path}</span>
                    <b>{f.findings} achado(s)</b>
                  </div>
                ))}
              </div>
            ) : (
              <Empty icon={FileCode2} title="Nenhum arquivo crítico">
                Nenhum arquivo de alto risco foi retornado pelo backend.
              </Empty>
            )}
          </section>
          <section className="panel panel-wide">
            <div className="panel-head">
              <div>
                <h2>Análises recentes</h2>
                <p>Histórico armazenado neste navegador</p>
              </div>
              <Link className="text-link" to="/analyses">
                Ver todas <ArrowUpRight size={15} />
              </Link>
            </div>
            {displayedRecent.length ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Projeto / arquivo</th>
                      <th>Data de envio</th>
                      <th>Situação no envio</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {displayedRecent.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <Link
                            className="file-link"
                            to={"/analysis/" + item.id}
                          >
                            <FileArchive size={17} />
                            <span>{item.repo_name||item.name}</span>
                          </Link>
                          <small className="mono">{item.id.slice(0, 8)}</small>
                        </td>
                        <td>{date(item.created_at||item.at)}</td>
                        <td>
                          <Status value={item.status} />
                        </td>
                        <td>
                          <Link
                            to={"/analysis/" + item.id}
                            aria-label="Abrir análise"
                          >
                            <ArrowUpRight size={18} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty icon={Clock3} title="Nenhuma análise neste navegador">
                Quando as execuções do GitHub Actions estiverem integradas ao
                backend, aparecerão aqui. Por enquanto, o histórico inclui
                apenas IDs já salvos neste navegador.
              </Empty>
            )}
          </section>
        </div>
      </main>
    </Layout>
  );
}
export default Dashboard;
