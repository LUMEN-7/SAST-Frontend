import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import Analysis from "./pages/Analysis/Analysis";
import Repositories from "./pages/Repositories/Repositories";
import RepositoryDetails from "./pages/RepositoryDetails/RepositoryDetails";
import Analyses from "./pages/Analyses/Analyses";
import Alerts from "./pages/Alerts/Alerts";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="/repositories" element={<Repositories />} />
      <Route path="/repositories/:id" element={<RepositoryDetails />} />
      <Route path="/analyses" element={<Analyses />} />
      <Route path="/alerts" element={<Alerts />} />
      <Route path="/analysis/:id" element={<Analysis />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
