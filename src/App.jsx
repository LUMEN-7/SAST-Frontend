import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import AuthPage from "./pages/Auth/Auth";
import Account from "./pages/Auth/Account";
import Dashboard from "./pages/Dashboard/Dashboard";
import Analysis from "./pages/Analysis/Analysis";
import Repositories from "./pages/Repositories/Repositories";
import RepositoryDetails from "./pages/RepositoryDetails/RepositoryDetails";
import Analyses from "./pages/Analyses/Analyses";
import Alerts from "./pages/Alerts/Alerts";
import LocalAnalyses from "./pages/LocalAnalyses/LocalAnalyses";

function Protected() {
  const { user, loading } = useAuth();
  if (loading) return <div className="auth-loading" role="status">Carregando sessão…</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
export default function App() {
  return (
    <AuthProvider><Routes>
      <Route path="/login" element={<AuthPage key="login" />} />
      <Route path="/register" element={<AuthPage key="register" />} />
      <Route path="/forgot-password" element={<AuthPage key="reset" />} />
      <Route element={<Protected />}>
      <Route path="/account" element={<Account />} />
      <Route path="/local-analyses" element={<LocalAnalyses />} />
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="/repositories" element={<Repositories />} />
      <Route path="/repositories/:id" element={<RepositoryDetails />} />
      <Route path="/analyses" element={<Analyses />} />
      <Route path="/alerts" element={<Alerts />} />
      <Route path="/analysis/:id" element={<Analysis />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes></AuthProvider>
  );
}
