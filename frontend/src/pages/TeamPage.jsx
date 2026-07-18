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
import { Modal, TextField, SelectField, ActionRow, Toast } from "../components/ui-kit";
import { Radar as RadarIcon, Save, Compass, Plus, ChevronRight, Target } from "lucide-react";

export default function TeamPage() {
  const { orgId, teamId } = useParams();
  const navigate = useNavigate();

  const [org, setOrg] = useState(null);
  const [team, setTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [zoomed, setZoomed] = useState(null);
  const [selectedChange, setSelectedChange] = useState(null);
  const [showNewChange, setShowNewChange] = useState(false);
  const [showNewStrategy, setShowNewStrategy] = useState(false);
  const [toast, setToast] = useState(null);

  const [teamDraft, setTeamDraft] = useState({ teamName: "", Context: "", Purpose: "" });
  const [dirty, setDirty] = useState(false);

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
      setTeams(teamsRes.body);
      const t = teamsRes.body.find((x) => x.teamId === teamId) || null;
      setTeam(t);
      if (t) {
        setTeamDraft({
          teamName: t.teamName || t.Name || "",
          Context: t.Context || "",
          Purpose: t.Purpose || "",
        });
        setDirty(false);
      }
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

  async function saveTeam() {
    if (!dirty) return;
    setSaving(true);
    const r = await api.teams.update(orgId, teamId, {
      teamId,
      teamName: teamDraft.teamName,
      Context: teamDraft.Context,
      Purpose: teamDraft.Purpose,
      Level: team?.Level ?? 1,
    });
    setSaving(false);
    if (!r.ok) return showToast(r.body?.error || r.error || "Failed to save team", "err");
    showToast("Team saved");
    setDirty(false);
    await load();
  }

  function updateDraft(patch) {
    setTeamDraft((d) => ({ ...d, ...patch }));
    setDirty(true);
  }

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
            <div className="mb-8 flex items-start justify-between gap-6">
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Team workspace</div>
                <h1 className="mt-2 text-4xl font-semibold tracking-tight" data-testid="team-heading">
                  {team.teamName || team.Name || "Team"}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {team.Context ? <span className="mr-3">Context · <span className="text-foreground">{team.Context}</span></span> : null}
                  Level {team.Level ?? 1}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/workspace/${encodeURIComponent(orgId)}`)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-accent transition"
                  data-testid="back-to-org-btn"
                >
                  ← Organigram
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
              {/* Left column: Team attributes + Strategies */}
              <div className="space-y-6">
                {/* Team attributes editor */}
                <div className="rounded-2xl border border-border bg-card/70 backdrop-blur p-5" data-testid="team-attributes-card">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold">Team attributes</div>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Edit &amp; save</div>
                    </div>
                    <button
                      onClick={saveTeam}
                      disabled={!dirty || saving}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground hover:brightness-110 disabled:opacity-40 transition btn-glow"
                      data-testid="save-team-btn"
                    >
                      <Save size={12} /> {saving ? "Saving…" : dirty ? "Save" : "Saved"}
                    </button>
                  </div>
                  <div className="space-y-3">
                    <TextField
                      label="Team name"
                      value={teamDraft.teamName}
                      onChange={(v) => updateDraft({ teamName: v })}
                      testId="team-name-input"
                    />
                    <TextField
                      label="Context"
                      value={teamDraft.Context}
                      onChange={(v) => updateDraft({ Context: v })}
                      placeholder="e.g. Growth"
                      testId="team-context-input"
                    />
                    <TextField
                      label="Purpose"
                      value={teamDraft.Purpose}
                      onChange={(v) => updateDraft({ Purpose: v })}
                      placeholder="Why this team exists…"
                      multiline
                      rows={3}
                      testId="team-purpose-input"
                    />
                  </div>
                </div>

                {/* Strategies list */}
                <div className="rounded-2xl border border-border bg-card/70 backdrop-blur p-5" data-testid="strategies-card">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Compass size={14} className="text-primary" />
                      <div>
                        <div className="text-sm font-semibold">Strategies</div>
                        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                          {strategies.length} defined
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowNewStrategy(true)}
                      className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] hover:bg-accent transition"
                      data-testid="new-strategy-btn"
                    >
                      <Plus size={12} /> New
                    </button>
                  </div>

                  {strategies.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                      No strategies yet.
                    </div>
                  ) : (
                    <ul className="space-y-1.5">
                      {strategies.map((s) => (
                        <li key={s.strategyId}>
                          <button
                            onClick={() => navigate(`/workspace/${encodeURIComponent(orgId)}/team/${encodeURIComponent(teamId)}/strategy/${encodeURIComponent(s.strategyId)}`)}
                            className="card-lift w-full flex items-center justify-between gap-2 rounded-xl border border-border bg-background/40 px-3 py-2.5 text-left transition"
                            data-testid={`strategy-row-${s.strategyId}`}
                          >
                            <div className="flex items-center gap-2">
                              <Target size={14} className="text-primary/80" />
                              <div>
                                <div className="text-sm font-medium">{s.strategyName}</div>
                                {s.strategyTimeframe && (
                                  <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                                    {s.strategyTimeframe}
                                  </div>
                                )}
                              </div>
                            </div>
                            <ChevronRight size={14} className="text-muted-foreground" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Environmental changes summary */}
                <div className="rounded-2xl border border-border bg-card/70 backdrop-blur p-5" data-testid="changes-summary-card">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RadarIcon size={14} className="text-primary" />
                      <div>
                        <div className="text-sm font-semibold">Environmental changes</div>
                        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                          {changes.length} plotted
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowNewChange(true)}
                      className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground hover:brightness-110 transition btn-glow"
                      data-testid="detect-change-btn"
                    >
                      + Detect
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {QUADRANTS.map((q) => (
                      <button
                        key={q}
                        onClick={() => setZoomed(q)}
                        className="rounded-lg border border-border bg-background/40 px-3 py-2 text-left transition hover:bg-accent/40"
                        data-testid={`quadrant-count-${q}`}
                      >
                        <div className="text-[10px] font-bold tracking-[0.18em]" style={{ color: quadrantColor[q] }}>{q}</div>
                        <div className="text-xl font-semibold">{counts[q]}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <Legend />
              </div>

              {/* Right column: Radar */}
              <div className="rounded-2xl border border-border bg-card/70 backdrop-blur p-6" data-testid="radar-card">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Radar</div>
                    <h2 className="mt-1 text-xl font-semibold tracking-tight">Environmental view</h2>
                    <p className="text-xs text-muted-foreground">
                      Click a quadrant to zoom · click a point for details.
                    </p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <Radar
                    changes={changes}
                    size={620}
                    onSelectQuadrant={(q) => setZoomed(q)}
                    onSelectChange={(c) => setSelectedChange(c)}
                  />
                </div>
              </div>
            </div>
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
        <Modal title={selectedChange.envChangeTitle} onClose={() => setSelectedChange(null)} testId="change-detail-modal">
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
        </Modal>
      )}

      {showNewChange && (
        <NewChangeModal
          orgId={orgId}
          teamId={teamId}
          onClose={() => setShowNewChange(false)}
          onCreated={async () => { await load(); showToast("Environmental change detected"); }}
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

      <Toast toast={toast} />
    </div>
  );
}

function NewChangeModal({ orgId, teamId, onClose, onCreated, onError }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("BUSINESS");
  const [lifecycle, setLifecycle] = useState("DETECTED");
  const [impact, setImpact] = useState("MEDIUM");
  const [effort, setEffort] = useState("MEDIUM");
  const [nature, setNature] = useState("THREAT");
  const [detect, setDetect] = useState("");
  const [assess, setAssess] = useState("");
  const [respond, setRespond] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    const r = await api.environmentalChanges.create(orgId, teamId, {
      envChangeId: generateId(),
      envChangeTitle: title,
      category, detect, assess, respond, impact, effort, nature, lifecycle,
    });
    setLoading(false);
    if (!r.ok) return onError(r.body?.error || r.error || "Failed to create change");
    onCreated();
    onClose();
  }

  return (
    <Modal title="Detect environmental change" onClose={onClose} testId="new-change-modal">
      <form onSubmit={submit} className="space-y-3">
        <TextField label="Title" value={title} onChange={setTitle} placeholder="e.g. Regulatory shift in EU" testId="new-change-title-input" />
        <TextField label="What was detected?" value={detect} onChange={setDetect} placeholder="Describe the signal…" multiline />
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Category / Quadrant" value={category} options={QUADRANTS} onChange={setCategory} testId="new-change-category-select" />
          <SelectField label="Lifecycle state" value={lifecycle} options={STATES} onChange={setLifecycle} />
          <SelectField label="Impact" value={impact} options={IMPACTS} onChange={setImpact} />
          <SelectField label="Effort" value={effort} options={EFFORTS} onChange={setEffort} />
          <SelectField label="Nature" value={nature} options={NATURES} onChange={setNature} />
        </div>
        <TextField label="Assessment" value={assess} onChange={setAssess} placeholder="Initial analysis…" multiline />
        <TextField label="Response plan" value={respond} onChange={setRespond} placeholder="Planned response…" multiline />
        <div className="rounded-md border border-border bg-background/40 p-3 text-[11px] text-muted-foreground">
          Radar mapping: <strong className="text-foreground">{category}</strong> quadrant · ring{" "}
          <strong className="text-foreground">{lifecycle}</strong> · {impact} impact · {effort} effort ·{" "}
          {nature === "THREAT" ? "triangle" : "circle"}
        </div>
        <ActionRow onCancel={onClose} submitLabel="Detect change" loading={loading} testIdPrefix="new-change" />
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
