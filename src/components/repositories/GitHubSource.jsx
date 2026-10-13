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
function GitHubSource() {
  const [url, setUrl] = useState("");
  const [job, setJob] = useState("");
  const [notice, setNotice] = useState("");
  const navigate = useNavigate();
  function openJob(e) {
    e.preventDefault();
    const id = job.trim();
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      )
    ) {
      setNotice("Informe um ID de análise válido (UUID).");
      return;
    }
    navigate("/analysis/" + id);
  }
  function selectRepo(e) {
    e.preventDefault();
    try {
      const u = new URL(url);
      if (
        u.hostname !== "github.com" ||
        u.pathname.split("/").filter(Boolean).length < 2
      )
        throw Error();
      setNotice(
        "Repositório identificado. A API atual ainda não possui endpoint para iniciar uma análise por URL ou receber os resultados do GitHub Actions. Nenhum código foi enviado.",
      );
    } catch {
      setNotice(
        "Cole um endereço válido, como https://github.com/organizacao/repositorio.",
      );
    }
  }
  return (
    <div className="source-panel">
      <div className="source-header">
        <Github size={21} />
        <div>
          <b>Repositório GitHub</b>
          <p>Informe o endereço do repositório.</p>
        </div>
        <span className="coming-soon">Integração pendente</span>
      </div>
      <form onSubmit={selectRepo} className="source-form">
        <label htmlFor="repository-url">URL DO REPOSITÓRIO</label>
        <div className="source-field">
          <GitBranch size={17} />
          <input
            id="repository-url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setNotice("");
            }}
            placeholder="https://github.com/organizacao/repositorio"
          />
          <button className="btn btn-primary" type="submit">
            Verificar integração
          </button>
        </div>
      </form>
      {notice && (
        <div className="source-notice" role="status">
          {notice}
        </div>
      )}
      <form onSubmit={openJob} className="job-lookup">
        <label htmlFor="analysis-job">Já possui um ID de análise?</label>
        <input
          id="analysis-job"
          value={job}
          onChange={(e) => setJob(e.target.value)}
          placeholder="UUID da execução"
        />
        <button className="btn btn-outline" type="submit">
          Abrir resultado <ArrowRight size={14} />
        </button>
      </form>
    </div>
  );
}
import "./GitHubSource.css";
export default GitHubSource;
