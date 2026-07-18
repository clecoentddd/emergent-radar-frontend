import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, clearAllAuth, generateId, getConfig, setSavedOrgId } from "../lib/stradar-api";
import { AppHeader } from "../components/AppHeader";
import { TeamOrganigram } from "../components/TeamOrganigram";
import { Modal, TextField, ActionRow, Toast } from "../components/ui-kit";

export default function OrgWorkspacePage() {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const [org, setOrg] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTeam, setShowNewTeam] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, kind = "ok") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const [orgsRes, teamsRes] = await Promise.all([
      api.organizations.list(),
      api.teams.list(orgId),
    ]);
    setLoading(false);
    if (orgsRes.status === 401) { clearAllAuth(); navigate("/login"); return; }
    if (orgsRes.ok && Array.isArray(orgsRes.body)) {
      const found = orgsRes.body.find((o) => o.organizationId === orgId);
      setOrg(found || null);
    }
    setTeams(teamsRes.ok && Array.isArray(teamsRes.body) ? teamsRes.body : []);
  }, [orgId, navigate]);

  useEffect(() => {
    if (!getConfig().token) { navigate("/login"); return; }
    setSavedOrgId(orgId);
    load();
  }, [orgId, load, navigate]);

  function selectTeam(team) {
    navigate(`/workspace/${encodeURIComponent(orgId)}/team/${encodeURIComponent(team.teamId)}`);
  }

  return (
    <div className="min-h-screen">
      <AppHeader
        organizationName={org?.organizationName}
        onSwitchOrg={() => navigate("/organizations")}
        breadcrumbs={[{ label: "Organizations", to: "/organizations" }, { label: org?.organizationName || "Workspace" }]}
      />

      <main className="mx-auto max-w-6xl px-6 py-12" data-testid="workspace-page">
        <div className="mb-10">
          <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Company organigram</div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            {org ? org.organizationName : "Loading…"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Every team under this organization is shown top-down. Select a team to edit its attributes,
            explore its radar, and access its strategies.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
            Loading organigram…
          </div>
        ) : org ? (
          <TeamOrganigram
            organization={org}
            teams={teams}
            onSelectTeam={selectTeam}
            onCreateTeam={() => setShowNewTeam(true)}
          />
        ) : (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
            Organization not found.
          </div>
        )}
      </main>

      {showNewTeam && (
        <NewTeamModal
          orgId={orgId}
          onClose={() => setShowNewTeam(false)}
          onCreated={async () => { await load(); showToast("Team created"); }}
          onError={(m) => showToast(m, "err")}
        />
      )}
      <Toast toast={toast} />
    </div>
  );
}

function NewTeamModal({ orgId, onClose, onCreated, onError }) {
  const [name, setName] = useState("");
  const [context, setContext] = useState("");
  const [purpose, setPurpose] = useState("");
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    const r = await api.teams.create(orgId, {
      teamId: generateId(),
      teamName: name,
      Context: context,
      Purpose: purpose,
      Level: Number(level) || 1,
    });
    setLoading(false);
    if (!r.ok) return onError(r.body?.error || r.error || "Failed to create team");
    onCreated();
    onClose();
  }
  return (
    <Modal title="New team" onClose={onClose} testId="new-team-modal">
      <form onSubmit={submit} className="space-y-3">
        <TextField label="Team name" value={name} onChange={setName} placeholder="e.g. Growth Team" testId="new-team-name-input" />
        <div className="grid grid-cols-[1fr_120px] gap-3">
          <TextField label="Context" value={context} onChange={setContext} placeholder="e.g. Growth" testId="new-team-context-input" />
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Level</span>
            <input
              type="number"
              min={1}
              step={1}
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition"
              data-testid="new-team-level-input"
            />
          </label>
        </div>
        <TextField label="Purpose" value={purpose} onChange={setPurpose} placeholder="Team purpose" testId="new-team-purpose-input" multiline />
        <ActionRow onCancel={onClose} submitLabel="Create team" loading={loading} testIdPrefix="new-team" />
      </form>
    </Modal>
  );
}
