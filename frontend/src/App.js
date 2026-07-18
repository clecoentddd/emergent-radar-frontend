import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import OrganizationsPage from "./pages/OrganizationsPage";
import OrgWorkspacePage from "./pages/OrgWorkspacePage";
import TeamPage from "./pages/TeamPage";
import StrategyPage from "./pages/StrategyPage";
import { getConfig } from "./lib/stradar-api";

function RootRedirect() {
  const c = getConfig();
  return <Navigate to={c.token ? "/organizations" : "/login"} replace />;
}

function App() {
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
