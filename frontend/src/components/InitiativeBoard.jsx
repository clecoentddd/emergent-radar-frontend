import { useCallback, useEffect, useState } from "react";
import { api, VALID_INITIATIVE_ITEM_STEPS } from "../lib/stradar-api";
import { Loader2 } from "lucide-react";

/**
 * InitiativeBoard — 4-step planning kanban for a single strategy.
 * Rendered inline inside expanded Strategy rows.
 *
 * We deliberately keep this monochrome: the strategy tint (accentColor) is the
 * only chromatic accent used. Step columns are distinguished by typography
 * (weight + letter-spacing) and a tiny top rule.
 */
export function InitiativeBoard({ orgId, teamId, strategy, accentColor, onToast }) {
  const strategyId = strategy.strategyId;
  const [initiatives, setInitiatives] = useState([]);
  const [items, setItems] = useState({}); // keyed by initiativeId
  const [activeInitiative, setActiveInitiative] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await api.initiatives.list(strategyId);
    const list = r.ok && Array.isArray(r.body) ? r.body : [];
    setInitiatives(list);
    if (list.length > 0 && !activeInitiative) setActiveInitiative(list[0].initiativeId);
    setLoading(false);
  }, [strategyId, activeInitiative]);

  useEffect(() => { load(); }, [load]);

  const loadItems = useCallback(async (initiativeId) => {
    const r = await api.initiativeItems.list(initiativeId);
    setItems((prev) => ({ ...prev, [initiativeId]: r.ok && Array.isArray(r.body) ? r.body : [] }));
  }, []);

  useEffect(() => { if (activeInitiative) loadItems(activeInitiative); }, [activeInitiative, loadItems]);

  const activeItems = activeInitiative ? items[activeInitiative] || [] : [];

  return (
    <div className="mt-3 rounded-xl border border-border bg-background/40 p-4" data-testid={`initiative-board-${strategyId}`}>
      {loading ? (
        <BoardSkeleton />
      ) : initiatives.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
          <div className="text-sm text-muted-foreground">No initiatives yet.</div>
          <button
            onClick={() => setShowNew(true)}
            className="rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground transition"
            style={{ background: accentColor }}
            data-testid={`add-first-initiative-${strategyId}`}
          >
            + Create the first initiative
          </button>
        </div>
      ) : (
        <>
          {/* Initiative tabs — single accent, no rainbow */}
          <div className="mb-3 flex flex-wrap items-center gap-1">
            {initiatives.map((i) => {
              const active = i.initiativeId === activeInitiative;
              return (
                <button
                  key={i.initiativeId}
                  onClick={() => setActiveInitiative(i.initiativeId)}
                  className="rounded-full border px-3 py-1 text-xs font-medium transition"
                  style={active
                    ? { background: accentColor, borderColor: accentColor, color: "var(--primary-foreground)" }
                    : { borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                  data-testid={`initiative-tab-${i.initiativeId}`}
                >
                  {i.initiativeName}
                </button>
              );
            })}
            <button
              onClick={() => setShowNew(true)}
              className="rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/40 transition"
              data-testid={`add-initiative-${strategyId}`}
            >
              + Initiative
            </button>
          </div>

          {activeInitiative && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {VALID_INITIATIVE_ITEM_STEPS.map((step) => (
                <StepColumn
                  key={step}
                  step={step}
                  items={activeItems.filter((it) => it.step === step)}
                  accentColor={accentColor}
                  onAdd={async (content) => {
                    const r = await api.initiativeItems.create(orgId, teamId, strategyId, activeInitiative, step, content);
                    if (!r.ok) return onToast?.(r.body?.error || r.error || "Failed to add", "err");
                    await loadItems(activeInitiative);
                  }}
                  onUpdate={async (item, content) => {
                    const r = await api.initiativeItems.update(orgId, teamId, strategyId, activeInitiative, item.itemId, step, content);
                    if (!r.ok) return onToast?.(r.body?.error || r.error || "Failed to update", "err");
                    await loadItems(activeInitiative);
                  }}
                  onDelete={async (item) => {
                    if (!window.confirm("Delete this item?")) return;
                    const r = await api.initiativeItems.remove(orgId, teamId, strategyId, activeInitiative, item.itemId);
                    if (!r.ok) return onToast?.(r.body?.error || r.error || "Failed to delete", "err");
                    await loadItems(activeInitiative);
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}

      {showNew && (
        <NewInitiativePrompt
          onCancel={() => setShowNew(false)}
          accentColor={accentColor}
          onCreate={async (name) => {
            if (!name.trim()) return;
            const r = await api.initiatives.create(orgId, teamId, strategyId, name.trim());
            if (!r.ok) return onToast?.(r.body?.error || r.error || "Failed to create initiative", "err");
            setShowNew(false);
            await load();
          }}
        />
      )}
    </div>
  );
}

function StepColumn({ step, index, totalSteps, items, accentColor, onAdd, onUpdate, onDelete }) {
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState(null);
  const isLast = index === totalSteps - 1;

  return (
    <div className="relative flex min-h-[240px] flex-col rounded-lg border border-border bg-card">
      {/* Process arrow to next step */}
      {!isLast && (
        <div
          className="pointer-events-none absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground"
          aria-hidden
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5h6M5.5 2.5 8 5l-2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      <div className="border-b border-border px-3 py-2" style={{ boxShadow: `inset 3px 0 0 ${accentColor}` }}>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold font-mono tabular-nums"
            style={{ background: `color-mix(in oklch, ${accentColor} 25%, transparent)`, color: accentColor }}
          >
            {index + 1}
          </span>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground truncate">{step}</div>
        </div>
        <div className="mt-0.5 text-[10px] font-mono tabular-nums text-muted-foreground">{items.length} item{items.length === 1 ? "" : "s"}</div>
      </div>
      <div className="flex-1 space-y-1.5 overflow-auto p-2">
        {items.length === 0 && (
          <div className="rounded-md border border-dashed border-border p-2 text-center text-[11px] text-muted-foreground">
            Empty
          </div>
        )}
        {items.map((it) => (
          <ItemCard
            key={it.itemId}
            item={it}
            editing={editingId === it.itemId}
            onEdit={() => setEditingId(it.itemId)}
            onCancel={() => setEditingId(null)}
            onSave={async (c) => { await onUpdate(it, c); setEditingId(null); }}
            onDelete={() => onDelete(it)}
          />
        ))}
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); if (draft.trim()) { onAdd(draft); setDraft(""); } }}
        className="space-y-1.5 border-t border-border p-2"
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add an item…"
          rows={2}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) e.currentTarget.form.requestSubmit();
          }}
          className="w-full resize-none rounded-md border border-border bg-input px-2 py-1.5 text-xs outline-none focus:border-primary transition"
          data-testid={`draft-${step}`}
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="w-full rounded-md px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground disabled:opacity-30 transition"
          style={{ background: accentColor }}
          data-testid={`add-item-${step}`}
        >
          + Add
        </button>
      </form>
    </div>
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
          autoFocus
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
    <div className="group rounded-md border border-border bg-card px-2 py-1.5 text-xs" data-testid={`item-${item.itemId}`}>
      <div className="whitespace-pre-wrap break-words">{item.content}</div>
      <div className="mt-1 flex justify-end gap-2 opacity-0 transition group-hover:opacity-100">
        <button onClick={onEdit} className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground">Edit</button>
        <button onClick={onDelete} className="text-[10px] uppercase tracking-wider text-destructive hover:opacity-80">Delete</button>
      </div>
    </div>
  );
}

function NewInitiativePrompt({ onCreate, onCancel, accentColor }) {
  const [name, setName] = useState("");
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onCreate(name); }}
      className="mt-3 flex items-center gap-2 rounded-md border border-border bg-card px-2 py-2"
    >
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Initiative name…"
        className="flex-1 rounded-md border border-border bg-input px-2 py-1.5 text-xs outline-none focus:border-primary"
        data-testid="new-initiative-inline-input"
      />
      <button
        type="button"
        onClick={onCancel}
        className="rounded-md border border-border px-3 py-1.5 text-[10px] uppercase tracking-wider hover:bg-accent transition"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={!name.trim()}
        className="rounded-md px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground disabled:opacity-40 transition"
        style={{ background: accentColor }}
        data-testid="new-initiative-inline-submit"
      >
        Create
      </button>
    </form>
  );
}

function BoardSkeleton() {
  return (
    <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
      <Loader2 size={14} className="animate-spin" /> Loading initiatives…
    </div>
  );
}
