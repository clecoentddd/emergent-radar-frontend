import "./App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import OrganizationsPage from "./pages/OrganizationsPage";
import OrgWorkspacePage from "./pages/OrgWorkspacePage";
import TeamPage from "./pages/TeamPage";
import StrategyPage from "./pages/StrategyPage";
import { getConfig } from "./lib/stradar-api";
import { applyTheme, getStoredTheme } from "./lib/themes";

function RootRedirect() {
  const c = getConfig();
  return <Navigate to={c.token ? "/organizations" : "/login"} replace />;
}

function App() {
  useEffect(() => {
    applyTheme(getStoredTheme());
  }, []);
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/organizations" element={<OrganizationsPage />} />
          <Route path="/workspace/:orgId" element={<OrgWorkspacePage />} />
          <Route path="/workspace/:orgId/team/:teamId" element={<TeamPage />} />
          <Route path="/workspace/:orgId/team/:teamId/strategy/:strategyId" element={<StrategyPage />} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
