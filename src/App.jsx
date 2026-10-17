import Onboarding from "./pages/Auth/Onboarding";
import DesignReview, { NotFound } from "./pages/DesignReview";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
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
import Rules from "./pages/Rules/Rules";
import Groups from "./pages/Groups/Groups";

function Protected() {
  const { user, loading, needsOnboarding } = useAuth();
  const location = useLocation();
  if (loading) return <div className="auth-loading" role="status">Carregando sessão…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (needsOnboarding && location.pathname !== "/onboarding") return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}
export default function App() {
  return (
    <AuthProvider><Routes>
      <Route path="/design" element={<DesignReview />} />
      <Route path="/login" element={<AuthPage key="login" />} />
      <Route path="/register" element={<AuthPage key="register" />} />
      <Route path="/forgot-password" element={<AuthPage key="reset" />} />
      <Route element={<Protected />}>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/account" element={<Account />} />
      <Route path="/local-analyses" element={<LocalAnalyses />} />
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="/repositories" element={<Repositories />} />
      <Route path="/repositories/:id" element={<RepositoryDetails />} />
      <Route path="/analyses" element={<Analyses />} />
      <Route path="/alerts" element={<Alerts />} />
      <Route path="/rules" element={<Rules />} />
      <Route path="/groups" element={<Groups />} />
      <Route path="/analysis/:id" element={<Analysis />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes></AuthProvider>
  );
}
