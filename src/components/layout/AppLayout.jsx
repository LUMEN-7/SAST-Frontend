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
  Bell,
  ClipboardList,
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
import Brand from "./Brand";
import "./AppLayout.css";
function Layout({ children, dashboard = false }) {
  const currentPath = useLocation().pathname;
  const pageTitle = currentPath.startsWith("/repositories/")
    ? "Histórico do repositório"
    : currentPath.startsWith("/analysis/")
      ? "Detalhes da análise"
      : currentPath.startsWith("/repositories")
        ? "Repositórios"
        : currentPath.startsWith("/analyses")
          ? "Análises"
          : currentPath.startsWith("/alerts")
            ? "Alertas"
            : "Visão geral";
  return (
    <div className="app tool-app">
      <aside className="tool-sidebar">
        <Brand />
        <div className="sidebar-caption">WORKSPACE</div>
        <nav className="side-nav">
          <NavLink end to="/">
            <LayoutDashboard size={18} /> Visão geral
          </NavLink>
          <NavLink to="/repositories">
            <Github size={18} /> Repositórios
          </NavLink>
          <NavLink to="/analyses">
            <ClipboardList size={18} /> Análises
          </NavLink>
          <NavLink to="/alerts">
            <Bell size={18} /> Alertas
          </NavLink>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <span className="avatar-guest">
              <Shield size={18} />
            </span>
            <span>
              <b>Sessão visitante</b>
              <small>Consulta de análises</small>
            </span>
          </div>
        </div>
      </aside>
      <div className="tool-main">
        <div className="tool-toolbar">
          <div className="tool-breadcrumb">
            <span>WORKSPACE</span>
            <span>/</span>
            <b>{pageTitle}</b>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
export default Layout;
