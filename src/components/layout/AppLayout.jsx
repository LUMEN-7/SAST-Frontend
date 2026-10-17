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
  SlidersHorizontal,
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
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../../auth/AuthContext";
import "./AppLayout.css";
function Layout({ children, dashboard = false }) {
  const { user } = useAuth();
  const currentPath = useLocation().pathname;
  const pageTitle = currentPath === "/account" ? "Meu perfil" : currentPath === "/rules" ? "Regras" : currentPath === "/local-analyses" ? "Scan local" : currentPath.startsWith("/repositories/")
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
          <NavLink to="/local-analyses"><FileCode2 size={18} /> Scan local</NavLink>
          <NavLink to="/repositories">
            <Github size={18} /> Repositórios
          </NavLink>
          <NavLink to="/analyses">
            <ClipboardList size={18} /> Análises
          </NavLink>
          <NavLink to="/rules"><SlidersHorizontal size={18} /> Regras</NavLink>
          <NavLink to="/alerts">
            <Bell size={18} /> Alertas
          </NavLink>
        </nav>
        <div className="sidebar-bottom">
          <NavLink to="/account" className="sidebar-user sidebar-account" aria-label="Minha conta">
            <span className="avatar-guest">
              {(user?.displayName || user?.email || "A").slice(0,2).toUpperCase()}
            </span>
            <span>
              <b>{user?.displayName || "Minha conta"}</b>
              <small>{user?.email}</small><span className="sidebar-account-label">Minha conta</span>
            </span>
          </NavLink>
        </div>
      </aside>
      <div className="tool-main">
        <div className="tool-toolbar">
          <div className="tool-breadcrumb">
            <span>WORKSPACE</span>
            <span>/</span>
            <b>{pageTitle}</b>
          </div>
          <ThemeToggle />
        </div>
        {children}
      </div>
    </div>
  );
}
export default Layout;
