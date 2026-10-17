import GitHubIcon from "../ui/GitHubIcon";
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
let lastNavHighlight = null;
function Layout({ children, dashboard = false }) {
  const { user } = useAuth();
  const currentPath = useLocation().pathname;
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef(null);
  const [navHighlight, setNavHighlight] = useState(() => lastNavHighlight);
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const update = () => {
      const active = nav.querySelector("a.active");
      if (!active || !nav.getClientRects().length) { setNavHighlight(null); return; }
      const rect = active.getBoundingClientRect(), parent = nav.getBoundingClientRect();
      const next = { width: rect.width, height: rect.height, transform: "translate("+(rect.left-parent.left)+"px, "+(rect.top-parent.top)+"px)" };
      lastNavHighlight = next;
      setNavHighlight(next);
    };
    let frame = requestAnimationFrame(() => { frame = requestAnimationFrame(update); });
    const observer = new ResizeObserver(() => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => { frame = requestAnimationFrame(update); }); });
    observer.observe(nav);
    window.addEventListener("resize", update);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("resize", update); };
  }, [currentPath, mobileOpen]);
  useEffect(() => setMobileOpen(false), [currentPath]);
  useEffect(() => {
    if (!mobileOpen) return;
    const closeOnEscape = event => { if (event.key === "Escape") { setMobileOpen(false); document.querySelector(".mobile-nav-toggle")?.focus(); } };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);
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
      <aside className={"tool-sidebar" + (mobileOpen ? " is-mobile-open" : "")}>
        <div className="mobile-nav-header"><Brand /><button type="button" className="mobile-nav-toggle" aria-expanded={mobileOpen} aria-controls="workspace-nav" aria-label={mobileOpen ? "Fechar navegação" : "Abrir navegação"} onClick={() => setMobileOpen(value => !value)}>{mobileOpen ? <X size={22} /> : <Menu size={22} />}</button></div>
        <div className="sidebar-caption">WORKSPACE</div>
        <nav ref={navRef} className="side-nav sliding-nav" id="workspace-nav" aria-label="Navegação principal">
          {navHighlight && <span className="nav-sliding-highlight" style={navHighlight} aria-hidden="true" />}
          <NavLink end to="/">
            <LayoutDashboard size={18} /> Visão geral
          </NavLink>
          <NavLink to="/local-analyses"><FileCode2 size={18} /> Scan local</NavLink>
          <NavLink to="/repositories">
            <GitHubIcon size={18} /> Repositórios
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
              {(user?.displayName || user?.email || "A").trim().split(/\s+/).map(part => part[0]).filter(Boolean).slice(0,2).join("").toUpperCase()}
            </span>
            <span>
              <b>{user?.displayName || "Minha conta"}</b>
              <small title={user?.email}>{user?.email}</small><span className="sidebar-account-label">Minha conta</span>
            </span>
            <ChevronDown className="sidebar-account-arrow" size={16} aria-hidden="true" />
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
