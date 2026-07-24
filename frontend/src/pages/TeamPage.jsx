import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, clearAllAuth, generateId, getConfig } from "../lib/stradar-api";
import {
  EFFORTS, IMPACTS, NATURES, QUADRANTS, STATES,
  impactColor, quadrantColor,
  toEffort, toImpact, toNature, toQuadrant, toState,
} from "../lib/radar-model";
import { AppHeader } from "../components/AppHeader";
import { Radar } from "../components/Radar";
import { Legend } from "../components/Legend";
import { StrategyList } from "../components/StrategyList";
import { Modal, TextField, SelectField, ActionRow, Toast } from "../components/ui-kit";
import { Radar as RadarIcon, Compass, Plus, ChevronRight, Target, Pencil, ArrowLeft } from "lucide-react";

export default function TeamPage() {
  const { orgId, teamId } = useParams();
  const navigate = useNavigate();

  const [org, setOrg] = useState(null);
  const [team, setTeam] = useState(null);
  const [strategies, setStrategies] = useState([]);
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);

  const [zoomed, setZoomed] = useState(null);
  const [selectedChange, setSelectedChange] = useState(null);
  const [showNewChange, setShowNewChange] = useState(false);
  const [showEditChange, setShowEditChange] = useState(null); // holds the change being edited
  const [showNewStrategy, setShowNewStrategy] = useState(false);
  const [showEditTeam, setShowEditTeam] = useState(false);
  const [tab, setTab] = useState("radar"); // "radar" | "strategies"
  const [toast, setToast] = useState(null);

  const showToast = (msg, kind = "ok") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const [orgsRes, teamsRes, stratRes, chgRes] = await Promise.all([
      api.organizations.list(),
      api.teams.list(orgId),
      api.strategies.list(orgId, teamId),
      api.environmentalChanges.list(orgId, teamId),
    ]);
    setLoading(false);
    if (orgsRes.status === 401) { clearAllAuth(); navigate("/login"); return; }
    if (orgsRes.ok && Array.isArray(orgsRes.body)) {
      setOrg(orgsRes.body.find((o) => o.organizationId === orgId) || null);
    }
    if (teamsRes.ok && Array.isArray(teamsRes.body)) {
      setTeam(teamsRes.body.find((x) => x.teamId === teamId) || null);
    }
    setStrategies(stratRes.ok && Array.isArray(stratRes.body) ? stratRes.body : []);
    setChanges(chgRes.ok && Array.isArray(chgRes.body) ? chgRes.body : []);
  }, [orgId, teamId, navigate]);

  useEffect(() => {
    if (!getConfig().token) { navigate("/login"); return; }
    load();
  }, [load, navigate]);

  const counts = useMemo(() => {
    const c = { BUSINESS: 0, CAPABILITIES: 0, "PEOPLE & KNOWLEDGE": 0, "OPERATING MODEL": 0 };
    changes.forEach((ch) => (c[toQuadrant(ch.category)] += 1));
    return c;
  }, [changes]);

  return (
    <div className="min-h-screen pb-16">
      <AppHeader
        organizationName={org?.organizationName}
        onSwitchOrg={() => navigate("/organizations")}
        breadcrumbs={[
          { label: "Organizations", to: "/organizations" },
          { label: org?.organizationName || "Workspace", to: `/workspace/${encodeURIComponent(orgId)}` },
          { label: team?.teamName || team?.Name || "Team" },
        ]}
      />

      <main className="mx-auto max-w-7xl px-6 py-8" data-testid="team-page">
        {loading || !team ? (
          <div className="rounded-2xl border border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
            Loading team…
          </div>
        ) : (
          <>
            {/* Compact header: team name · level · edit pencil · back */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Team workspace</div>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-semibold tracking-tight" data-testid="team-heading">
                    {team.teamName || team.Name || "Team"}
                  </h1>
                  <span
                    className="rounded-full border border-border-strong bg-card-elevated px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em]"
                    style={{ color: "var(--section-team)" }}
                    data-testid="team-level-chip"
                  >
                    L{team.Level ?? 0}
                  </span>
                  <button
                    onClick={() => setShowEditTeam(true)}
                    className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] uppercase tracking-wider text-muted-foreground hover:bg-accent hover:text-foreground transition"
                    data-testid="edit-team-btn"
                    title="Edit team attributes"
                  >
                    <Pencil size={11} /> Edit
                  </button>
                </div>
                {(team.Context || team.Purpose) && (
                  <div className="mt-1 text-xs text-muted-foreground max-w-3xl">
                    {team.Context && <>Context · <span className="text-foreground">{team.Context}</span></>}
                    {team.Purpose && <span className="ml-2 opacity-70">· {team.Purpose}</span>}
                  </div>
                )}
              </div>
              <button
                onClick={() => navigate(`/workspace/${encodeURIComponent(orgId)}`)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-accent transition"
                data-testid="back-to-org-btn"
              >
                <ArrowLeft size={12} /> Organigram
              </button>
            </div>

            {/* Tab switcher */}
            <div className="mb-4 flex items-center gap-1 rounded-full border border-border bg-card-elevated p-1 w-fit" role="tablist" data-testid="team-tabs">
              <button
                role="tab"
                aria-selected={tab === "radar"}
                onClick={() => setTab("radar")}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                  tab === "radar"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="tab-radar"
              >
                <RadarIcon size={12} /> Radar
                <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-mono tabular-nums ${tab === "radar" ? "bg-primary-foreground/20" : "bg-muted"}`}>{changes.length}</span>
              </button>
              <button
                role="tab"
                aria-selected={tab === "strategies"}
                onClick={() => setTab("strategies")}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                  tab === "strategies"
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                style={tab === "strategies" ? { background: "var(--section-strategy)" } : undefined}
                data-testid="tab-strategies"
              >
                <Compass size={12} /> Strategies
                <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-mono tabular-nums ${tab === "strategies" ? "bg-primary-foreground/20" : "bg-muted"}`}>{strategies.length}</span>
              </button>
            </div>

            {tab === "radar" ? (
              <div className="section-card p-6" data-testid="radar-card">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Radar</div>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight">Environmental view</h2>
                    <p className="text-xs text-muted-foreground">
                      Click a quadrant to zoom · click a point to view &amp; edit.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowNewChange(true)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:brightness-110 transition btn-glow"
                    data-testid="detect-change-btn"
                  >
                    <Plus size={13} /> Detect
                  </button>
                </div>

                <div className="flex justify-center">
                  <Radar
                    changes={changes}
                    size={720}
                    onSelectQuadrant={(q) => setZoomed(q)}
                    onSelectChange={(c) => setSelectedChange(c)}
                  />
                </div>

                {/* Quadrant counts + inline legend */}
                <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    {QUADRANTS.map((q) => (
                      <button
                        key={q}
                        onClick={() => setZoomed(q)}
                        className="tile px-3 py-2 text-left transition hover:bg-accent/40"
                        data-testid={`quadrant-count-${q}`}
                      >
                        <div className="text-[10px] font-bold tracking-[0.18em]" style={{ color: quadrantColor[q] }}>{q}</div>
                        <div className="text-xl font-semibold font-mono tabular-nums">{counts[q]}</div>
                      </button>
                    ))}
                  </div>
                  <Legend />
                </div>
              </div>
            ) : (
              <div data-testid="strategies-card">
                <StrategyList
                  orgId={orgId}
                  teamId={teamId}
                  strategies={strategies}
                  accentColor="var(--section-strategy)"
                  loading={loading}
                  onCreate={() => setShowNewStrategy(true)}
                  onReload={load}
                  onToast={showToast}
                />
              </div>
            )}
          </>
        )}
      </main>

      {zoomed && (
        <Modal wide title={`${zoomed} · ${changes.filter((c) => toQuadrant(c.category) === zoomed).length} changes`} onClose={() => setZoomed(null)} testId="zoom-modal">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_320px]">
            <div className="flex justify-center">
              <Radar
                changes={changes.filter((c) => toQuadrant(c.category) === zoomed)}
                size={520}
                zoomedQuadrant={zoomed}
                onSelectChange={(c) => setSelectedChange(c)}
              />
            </div>
            <div className="max-h-[520px] space-y-2 overflow-auto">
              {changes.filter((c) => toQuadrant(c.category) === zoomed).length === 0 && (
                <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
                  No changes in this quadrant yet.
                </div>
              )}
              {changes.filter((c) => toQuadrant(c.category) === zoomed).map((c) => {
                const impact = toImpact(c.impact);
                return (
                  <button
                    key={c.envChangeId}
                    onClick={() => setSelectedChange(c)}
                    className="block w-full rounded-md border border-border bg-background/40 p-3 text-left transition hover:bg-accent/40"
                    data-testid={`zoom-change-${c.envChangeId}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: impactColor[impact] }} />
                      <div className="flex-1 truncate text-sm font-medium">{c.envChangeTitle}</div>
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {toState(c)} · {impact} impact · {toEffort(c.effort)} effort · {toNature(c.nature)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Modal>
      )}

      {selectedChange && (
        <Modal
          title={selectedChange.envChangeTitle}
          onClose={() => setSelectedChange(null)}
          testId="change-detail-modal"
        >
          <div className="space-y-1 text-sm">
            {[
              ["Category (quadrant)", toQuadrant(selectedChange.category)],
              ["Lifecycle", toState(selectedChange)],
              ["Impact", toImpact(selectedChange.impact)],
              ["Effort", toEffort(selectedChange.effort)],
              ["Nature", toNature(selectedChange.nature)],
              ["Detect", selectedChange.detect ?? "—"],
              ["Assess", selectedChange.assess ?? "—"],
              ["Respond", selectedChange.respond ?? "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-border/40 py-1.5">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium">{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSelectedChange(null)}
              className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent transition"
              data-testid="change-detail-close-btn"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => { setShowEditChange(selectedChange); setSelectedChange(null); }}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold uppercase tracking-wider text-primary-foreground hover:brightness-110 transition btn-glow"
              data-testid="edit-change-btn"
            >
              <Pencil size={12} /> Edit
            </button>
          </div>
        </Modal>
      )}

      {showNewChange && (
        <ChangeFormModal
          orgId={orgId}
          teamId={teamId}
          onClose={() => setShowNewChange(false)}
          onSaved={async () => { await load(); showToast("Environmental change detected"); }}
          onError={(m) => showToast(m, "err")}
        />
      )}

      {showEditChange && (
        <ChangeFormModal
          orgId={orgId}
          teamId={teamId}
          existing={showEditChange}
          onClose={() => setShowEditChange(null)}
          onSaved={async () => { await load(); showToast("Environmental change updated"); }}
          onError={(m) => showToast(m, "err")}
        />
      )}

      {showNewStrategy && (
        <NewStrategyModal
          orgId={orgId}
          teamId={teamId}
          onClose={() => setShowNewStrategy(false)}
          onCreated={async () => { await load(); showToast("Strategy created"); }}
          onError={(m) => showToast(m, "err")}
        />
      )}

      {showEditTeam && team && (
        <EditTeamModal
          orgId={orgId}
          team={team}
          onClose={() => setShowEditTeam(false)}
          onSaved={async () => { await load(); showToast("Team saved"); }}
          onError={(m) => showToast(m, "err")}
        />
      )}

      <Toast toast={toast} />
    </div>
  );
}

function EditTeamModal({ orgId, team, onClose, onSaved, onError }) {
  const [name, setName] = useState(team.teamName || team.Name || "");
  const [context, setContext] = useState(team.Context || "");
  const [purpose, setPurpose] = useState(team.Purpose || "");
  const [level, setLevel] = useState(team.Level !== undefined && team.Level !== null ? team.Level : 0);
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    const r = await api.teams.update(orgId, team.teamId, {
      teamId: team.teamId,
      teamName: name,
      Name: name,
      Context: context,
      Purpose: purpose,
      Level: level !== "" ? Number(level) : 0,
    });
    setLoading(false);
    if (!r.ok) return onError(r.body?.error || r.error || "Failed to save team");
    onSaved();
    onClose();
  }

  return (
    <Modal title="Edit team attributes" onClose={onClose} testId="edit-team-modal">
      <form onSubmit={submit} className="space-y-3">
        <TextField label="Team name" value={name} onChange={setName} testId="team-name-input" />
        <div className="grid grid-cols-[1fr_110px] gap-3">
          <TextField label="Context" value={context} onChange={setContext} placeholder="e.g. Growth" testId="team-context-input" />
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Level</span>
            <input
              type="number"
              min={1}
              step={1}
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition"
              data-testid="team-level-input"
            />
          </label>
        </div>
        <TextField label="Purpose" value={purpose} onChange={setPurpose} placeholder="Why this team exists…" multiline rows={3} testId="team-purpose-input" />
        <ActionRow onCancel={onClose} submitLabel="Save" loading={loading} testIdPrefix="edit-team" />
      </form>
    </Modal>
  );
}

function ChangeFormModal({ orgId, teamId, existing, onClose, onSaved, onError }) {
  const isEdit = Boolean(existing);
  const [title, setTitle] = useState(existing?.envChangeTitle || "");
  const [category, setCategory] = useState(existing ? toQuadrant(existing.category) : "BUSINESS");
  const [lifecycle, setLifecycle] = useState(existing ? toState(existing) : "DETECTED");
  const [impact, setImpact] = useState(existing ? toImpact(existing.impact) : "MEDIUM");
  const [effort, setEffort] = useState(existing ? toEffort(existing.effort) : "MEDIUM");
  const [nature, setNature] = useState(existing ? toNature(existing.nature) : "THREAT");
  const [detect, setDetect] = useState(existing?.detect ?? "");
  const [assess, setAssess] = useState(existing?.assess ?? "");
  const [respond, setRespond] = useState(existing?.respond ?? "");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    const payload = {
      envChangeTitle: title,
      category, detect, assess, respond, impact, effort, nature, lifecycle,
    };
    const r = isEdit
      ? await api.environmentalChanges.update(orgId, teamId, existing.envChangeId, payload)
      : await api.environmentalChanges.create(orgId, teamId, { envChangeId: generateId(), ...payload });
    setLoading(false);
    if (!r.ok) return onError(r.body?.error || r.error || (isEdit ? "Failed to update change" : "Failed to create change"));
    onSaved();
    onClose();
  }

  return (
    <Modal
      title={isEdit ? `Edit environmental change` : "Detect environmental change"}
      onClose={onClose}
      testId={isEdit ? "edit-change-modal" : "new-change-modal"}
    >
      <form onSubmit={submit} className="space-y-3">
        <TextField label="Title" value={title} onChange={setTitle} placeholder="e.g. Regulatory shift in EU" testId="change-title-input" />
        <TextField label="What was detected?" value={detect} onChange={setDetect} placeholder="Describe the signal…" multiline />
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Category / Quadrant" value={category} options={QUADRANTS} onChange={setCategory} testId="change-category-select" />
          <SelectField label="Lifecycle state" value={lifecycle} options={STATES} onChange={setLifecycle} testId="change-lifecycle-select" />
          <SelectField label="Impact" value={impact} options={IMPACTS} onChange={setImpact} testId="change-impact-select" />
          <SelectField label="Effort" value={effort} options={EFFORTS} onChange={setEffort} testId="change-effort-select" />
          <SelectField label="Nature" value={nature} options={NATURES} onChange={setNature} testId="change-nature-select" />
        </div>
        <TextField label="Assessment" value={assess} onChange={setAssess} placeholder="Initial analysis…" multiline />
        <TextField label="Response plan" value={respond} onChange={setRespond} placeholder="Planned response…" multiline />
        <div className="rounded-md border border-border bg-background/40 p-3 text-[11px] text-muted-foreground">
          Radar mapping: <strong className="text-foreground">{category}</strong> quadrant · ring{" "}
          <strong className="text-foreground">{lifecycle}</strong> · {impact} impact · {effort} effort ·{" "}
          {nature === "THREAT" ? "triangle" : "circle"}
        </div>
        <ActionRow onCancel={onClose} submitLabel={isEdit ? "Save changes" : "Detect change"} loading={loading} testIdPrefix={isEdit ? "edit-change" : "new-change"} />
      </form>
    </Modal>
  );
}

function NewStrategyModal({ orgId, teamId, onClose, onCreated, onError }) {
  const [name, setName] = useState("");
  const [timeframe, setTimeframe] = useState("30 days");
  const [loading, setLoading] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    const r = await api.strategies.create(orgId, teamId, {
      strategyId: generateId(),
      strategyName: name,
      strategyTimeframe: timeframe,
    });
    setLoading(false);
    if (!r.ok) return onError(r.body?.error || r.error || "Failed to create strategy");
    onCreated();
    onClose();
  }
  return (
    <Modal title="New strategy" onClose={onClose} testId="new-strategy-modal">
      <form onSubmit={submit} className="space-y-3">
        <TextField label="Strategy name" value={name} onChange={setName} placeholder="e.g. Q2 Market Expansion" testId="new-strategy-name-input" />
        <TextField label="Timeframe" value={timeframe} onChange={setTimeframe} testId="new-strategy-timeframe-input" />
        <ActionRow onCancel={onClose} submitLabel="Create" loading={loading} testIdPrefix="new-strategy" />
      </form>
    </Modal>
  );
}
