import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, clearAllAuth, getConfig, VALID_INITIATIVE_ITEM_STEPS } from "../lib/stradar-api";
import { AppHeader } from "../components/AppHeader";
import { Modal, TextField, ActionRow, Toast } from "../components/ui-kit";
import { Plus, Target, Compass } from "lucide-react";

const STEP_ACCENT = {
  DIAGNOSTIC: "var(--q-business)",
  "OVERALL APPROACH": "var(--q-knowledge)",
  "COHERENT SET OF ACTIONS": "var(--q-capabilities)",
  "PROXIMATE OBJECTIVES": "var(--q-people)",
};

export default function StrategyPage() {
  const { orgId, teamId, strategyId } = useParams();
  const navigate = useNavigate();

  const [org, setOrg] = useState(null);
  const [team, setTeam] = useState(null);
  const [strategy, setStrategy] = useState(null);
  const [initiatives, setInitiatives] = useState([]);
  const [openInitiative, setOpenInitiative] = useState(null);
  const [showNewInitiative, setShowNewInitiative] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg, kind = "ok") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const [orgsRes, teamsRes, stratRes, initRes] = await Promise.all([
      api.organizations.list(),
      api.teams.list(orgId),
      api.strategies.list(orgId, teamId),
      api.initiatives.list(strategyId),
    ]);
    setLoading(false);
    if (orgsRes.status === 401) { clearAllAuth(); navigate("/login"); return; }
    if (orgsRes.ok && Array.isArray(orgsRes.body)) {
      setOrg(orgsRes.body.find((o) => o.organizationId === orgId) || null);
    }
    if (teamsRes.ok && Array.isArray(teamsRes.body)) {
      setTeam(teamsRes.body.find((t) => t.teamId === teamId) || null);
    }
    if (stratRes.ok && Array.isArray(stratRes.body)) {
      setStrategy(stratRes.body.find((s) => s.strategyId === strategyId) || null);
    }
    setInitiatives(initRes.ok && Array.isArray(initRes.body) ? initRes.body : []);
  }, [orgId, teamId, strategyId, navigate]);

  useEffect(() => {
    if (!getConfig().token) { navigate("/login"); return; }
    load();
  }, [load, navigate]);

  return (
    <div className="min-h-screen pb-16">
      <AppHeader
        organizationName={org?.organizationName}
        onSwitchOrg={() => navigate("/organizations")}
        breadcrumbs={[
          { label: "Organizations", to: "/organizations" },
          { label: org?.organizationName || "Workspace", to: `/workspace/${encodeURIComponent(orgId)}` },
          { label: team?.teamName || "Team", to: `/workspace/${encodeURIComponent(orgId)}/team/${encodeURIComponent(teamId)}` },
          { label: strategy?.strategyName || "Strategy" },
        ]}
      />

      <main className="mx-auto max-w-6xl px-6 py-10" data-testid="strategy-page">
        {loading || !strategy ? (
          <div className="rounded-2xl border border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
            Loading strategy…
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-start justify-between gap-6">
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80 flex items-center gap-1.5">
                  <Compass size={12} /> Strategy
                </div>
                <h1 className="mt-2 text-4xl font-semibold tracking-tight" data-testid="strategy-heading">
                  {strategy.strategyName}
                </h1>
                {strategy.strategyTimeframe && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Timeframe: <span className="text-foreground">{strategy.strategyTimeframe}</span>
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowNewInitiative(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:brightness-110 transition btn-glow"
                data-testid="new-initiative-btn"
              >
                <Plus size={14} /> New initiative
              </button>
            </div>

            {initiatives.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
                No initiatives yet. Create one to plan actions using the four-step framework.
              </div>
            ) : (
              <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {initiatives.map((i) => (
                  <li key={i.initiativeId}>
                    <button
                      onClick={() => setOpenInitiative(i)}
                      className="card-lift w-full text-left rounded-2xl border border-border bg-card p-4"
                      data-testid={`initiative-card-${i.initiativeId}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-lg bg-primary/15 ring-1 ring-primary/40 flex items-center justify-center">
                          <Target size={16} className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold">{i.initiativeName}</div>
                          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Open board →</div>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>

      {showNewInitiative && (
        <NewInitiativeModal
          orgId={orgId} teamId={teamId} strategyId={strategyId}
          onClose={() => setShowNewInitiative(false)}
          onCreated={async () => { await load(); showToast("Initiative created"); }}
          onError={(m) => showToast(m, "err")}
        />
      )}

      {openInitiative && (
        <InitiativeBoardModal
          orgId={orgId} teamId={teamId} strategyId={strategyId}
          initiative={openInitiative}
          onClose={() => setOpenInitiative(null)}
          onError={(m) => showToast(m, "err")}
          onCreated={() => showToast("Item added")}
        />
      )}

      <Toast toast={toast} />
    </div>
  );
}

function NewInitiativeModal({ orgId, teamId, strategyId, onClose, onCreated, onError }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    const r = await api.initiatives.create(orgId, teamId, strategyId, name);
    setLoading(false);
    if (!r.ok) return onError(r.body?.error || r.error || "Failed to create initiative");
    onCreated();
    onClose();
  }
  return (
    <Modal title="New initiative" onClose={onClose} testId="new-initiative-modal">
      <form onSubmit={submit} className="space-y-3">
        <TextField label="Initiative name" value={name} onChange={setName} placeholder="e.g. Launch EU pilot" testId="new-initiative-name-input" />
        <ActionRow onCancel={onClose} submitLabel="Create" loading={loading} testIdPrefix="new-initiative" />
      </form>
    </Modal>
  );
}

function InitiativeBoardModal({ orgId, teamId, strategyId, initiative, onClose, onCreated, onError }) {
  const [items, setItems] = useState([]);
  const [drafts, setDrafts] = useState({
    DIAGNOSTIC: "", "OVERALL APPROACH": "", "COHERENT SET OF ACTIONS": "", "PROXIMATE OBJECTIVES": "",
  });
  const [busyStep, setBusyStep] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const load = useCallback(async () => {
    const r = await api.initiativeItems.list(initiative.initiativeId);
    setItems(r.ok && Array.isArray(r.body) ? r.body : []);
  }, [initiative.initiativeId]);

  useEffect(() => { load(); }, [load]);

  async function addItem(step) {
    const content = drafts[step].trim();
    if (!content) return;
    setBusyStep(step);
    const r = await api.initiativeItems.create(orgId, teamId, strategyId, initiative.initiativeId, step, content);
    setBusyStep(null);
    if (!r.ok) return onError(r.body?.error || r.error || "Failed to add item");
    setDrafts((d) => ({ ...d, [step]: "" }));
    onCreated();
    await load();
  }

  async function saveEdit(item, content) {
    const trimmed = content.trim();
    if (!trimmed || trimmed === item.content) { setEditingId(null); return; }
    const r = await api.initiativeItems.update(orgId, teamId, strategyId, initiative.initiativeId, item.itemId, item.step, trimmed);
    if (!r.ok) return onError(r.body?.error || r.error || "Failed to update item");
    setEditingId(null);
    await load();
  }

  async function removeItem(item) {
    if (!window.confirm("Delete this item?")) return;
    const r = await api.initiativeItems.remove(orgId, teamId, strategyId, initiative.initiativeId, item.itemId);
    if (!r.ok) return onError(r.body?.error || r.error || "Failed to delete item");
    await load();
  }

  return (
    <Modal wide title={`Initiative · ${initiative.initiativeName}`} onClose={onClose} testId="initiative-board-modal">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {VALID_INITIATIVE_ITEM_STEPS.map((step) => {
          const stepItems = items.filter((i) => i.step === step);
          return (
            <div key={step} className="flex min-h-[360px] flex-col rounded-lg border border-border bg-background/40">
              <div
                className="rounded-t-lg border-b border-border px-3 py-2"
                style={{ boxShadow: `inset 3px 0 0 ${STEP_ACCENT[step]}` }}
              >
                <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: STEP_ACCENT[step] }}>{step}</div>
                <div className="text-[10px] text-muted-foreground">{stepItems.length} item{stepItems.length === 1 ? "" : "s"}</div>
              </div>
              <div className="flex-1 space-y-2 overflow-auto p-3">
                {stepItems.length === 0 && (
                  <div className="rounded-md border border-dashed border-border p-3 text-[11px] text-muted-foreground">No items yet</div>
                )}
                {stepItems.map((it) => (
                  <ItemCard
                    key={it.itemId}
                    item={it}
                    editing={editingId === it.itemId}
                    onEdit={() => setEditingId(it.itemId)}
                    onCancel={() => setEditingId(null)}
                    onSave={(content) => saveEdit(it, content)}
                    onDelete={() => removeItem(it)}
                  />
                ))}
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); addItem(step); }}
                className="space-y-2 border-t border-border p-2"
              >
                <textarea
                  value={drafts[step]}
                  onChange={(e) => setDrafts((d) => ({ ...d, [step]: e.target.value }))}
                  placeholder="Add an item…"
                  rows={2}
                  className="w-full resize-none rounded-md border border-border bg-input px-2 py-1.5 text-xs outline-none focus:border-primary"
                  data-testid={`draft-${step}`}
                />
                <button
                  type="submit"
                  disabled={busyStep === step || !drafts[step].trim()}
                  className="w-full rounded-md bg-primary px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground disabled:opacity-40 transition"
                  data-testid={`add-item-${step}`}
                >
                  {busyStep === step ? "Adding…" : "+ Add"}
                </button>
              </form>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Items belong to one step and cannot be moved between steps.
      </p>
    </Modal>
  );
}

function ItemCard({ item, editing, onEdit, onCancel, onSave, onDelete }) {
  const [draft, setDraft] = useState(item.content);
  useEffect(() => { if (editing) setDraft(item.content); }, [editing, item.content]);

  if (editing) {
    return (
      <div className="rounded-md border border-primary/40 bg-card p-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-md border border-border bg-input px-2 py-1.5 text-xs outline-none focus:border-primary"
        />
        <div className="mt-1 flex justify-end gap-1">
          <button onClick={onCancel} className="rounded-md border border-border px-2 py-1 text-[10px] uppercase tracking-wider hover:bg-accent transition">Cancel</button>
          <button onClick={() => onSave(draft)} className="rounded-md bg-primary px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground transition">Save</button>
        </div>
      </div>
    );
  }

  return (
    <div className="group rounded-md border border-border bg-card p-2 text-sm">
      <div className="whitespace-pre-wrap break-words">{item.content}</div>
      <div className="mt-1 flex justify-end gap-2 opacity-0 transition group-hover:opacity-100">
        <button onClick={onEdit} className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground">Edit</button>
        <button onClick={onDelete} className="text-[10px] uppercase tracking-wider text-destructive hover:opacity-80">Delete</button>
      </div>
    </div>
  );
}
