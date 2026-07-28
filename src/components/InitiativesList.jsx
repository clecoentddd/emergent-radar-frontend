import { useCallback, useEffect, useState } from "react";
import { api, VALID_INITIATIVE_ITEM_STEPS } from "../lib/stradar-api";
import { quadrantColor, toQuadrant } from "../lib/radar-model";
import { ChevronDown, Loader2, Plus, Tag, X } from "lucide-react";

/**
 * InitiativesList — under a strategy tile: each initiative is a collapsible row.
 * Expanded row shows environmental-change tags plus the 4-step kanban
 * (DIAGNOSTIC → OVERALL APPROACH → COHERENT SET OF ACTIONS → PROXIMATE
 * OBJECTIVES) with process arrows.
 */
export function InitiativesList({ orgId, teamId, strategy, changes, accentColor, onToast }) {
  const strategyId = strategy.strategyId;
  const [initiatives, setInitiatives] = useState([]);
  const [items, setItems] = useState({}); // by initiativeId
  const [tags, setTags] = useState({}); // by initiativeId
  const [expanded, setExpanded] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadInitiatives = useCallback(async () => {
    setLoading(true);
    const r = await api.initiatives.list(strategyId);
    setInitiatives(r.ok && Array.isArray(r.body) ? r.body : []);
    setLoading(false);
  }, [strategyId]);

  const loadItems = useCallback(async (initiativeId) => {
    const r = await api.initiativeItems.list(initiativeId);
    setItems((prev) => ({ ...prev, [initiativeId]: r.ok && Array.isArray(r.body) ? r.body : [] }));
  }, []);

  const loadTags = useCallback(async (initiativeId) => {
    const r = await api.initiativeEnvChangeTags.list(initiativeId);
    setTags((prev) => ({ ...prev, [initiativeId]: r.ok && Array.isArray(r.body) ? r.body : [] }));
  }, []);

  useEffect(() => { loadInitiatives(); }, [loadInitiatives]);
  useEffect(() => {
    if (expanded) {
      loadItems(expanded);
      loadTags(expanded);
    }
  }, [expanded, loadItems, loadTags]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
        <Loader2 size={14} className="animate-spin" /> Loading initiatives…
      </div>
    );
  }

  return (
    <div className="space-y-2" data-testid={`initiatives-${strategyId}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Initiatives · {initiatives.length}
        </span>
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[10px] uppercase tracking-wider text-muted-foreground hover:bg-accent hover:text-foreground transition"
          data-testid={`add-initiative-${strategyId}`}
        >
          <Plus size={11} /> Initiative
        </button>
      </div>

      {showNew && (
        <NewInitiativePrompt
          accentColor={accentColor}
          onCancel={() => setShowNew(false)}
          onCreate={async (name) => {
            if (!name.trim()) return;
            const r = await api.initiatives.create(orgId, teamId, strategyId, name.trim());
            if (!r.ok) return onToast?.(r.body?.error || r.error || "Failed to create initiative", "err");
            setShowNew(false);
            await loadInitiatives();
          }}
        />
      )}

      {initiatives.length === 0 && !showNew ? (
        <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
          No initiatives yet.
        </div>
      ) : (
        <ul className="space-y-2">
          {initiatives.map((i) => {
            const isOpen = expanded === i.initiativeId;
            const initItems = items[i.initiativeId] || [];
            const initTags = tags[i.initiativeId] || [];
            return (
              <li
                key={i.initiativeId}
                className="rounded-lg border transition"
                style={isOpen
                  ? {
                      background: `color-mix(in oklch, ${accentColor} 10%, transparent)`,
                      borderColor: `color-mix(in oklch, ${accentColor} 55%, transparent)`,
                      boxShadow: `0 0 0 1px color-mix(in oklch, ${accentColor} 30%, transparent), 0 10px 30px -18px color-mix(in oklch, ${accentColor} 60%, transparent)`,
                    }
                  : {
                      background: "color-mix(in oklch, var(--background) 40%, transparent)",
                      borderColor: "var(--border)",
                    }}
                data-testid={`initiative-tile-${i.initiativeId}`}
              >
                <button
                  onClick={() => setExpanded((e) => (e === i.initiativeId ? null : i.initiativeId))}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition hover:bg-accent/20"
                >
                  <span
                    className="rounded-full transition"
                    style={{
                      background: accentColor,
                      width: isOpen ? 8 : 6,
                      height: isOpen ? 8 : 6,
                      boxShadow: isOpen ? `0 0 0 3px color-mix(in oklch, ${accentColor} 25%, transparent)` : "none",
                    }}
                  />
                  <span
                    className={`flex-1 truncate text-sm ${isOpen ? "font-semibold" : "font-medium"}`}
                    style={isOpen ? { color: accentColor } : undefined}
                  >
                    {i.initiativeName}
                  </span>
                  {!isOpen && initTags.length > 0 && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-mono tabular-nums text-muted-foreground"
                      title={`${initTags.length} environmental change tag${initTags.length === 1 ? "" : "s"}`}
                    >
                      <Tag size={10} /> {initTags.length}
                    </span>
                  )}
                  {isOpen && initItems.length > 0 && (
                    <span className="text-[10px] font-mono tabular-nums text-muted-foreground">
                      {initItems.length} item{initItems.length === 1 ? "" : "s"}
                    </span>
                  )}
                  <ChevronDown
                    size={14}
                    className="transition"
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      color: isOpen ? accentColor : "var(--muted-foreground)",
                    }}
                  />
                </button>
                {isOpen && (
                  <div
                    className="border-t p-3 fade-up"
                    style={{ borderColor: `color-mix(in oklch, ${accentColor} 30%, transparent)` }}
                  >
                    <TagsRow
                      orgId={orgId}
                      initiativeId={i.initiativeId}
                      changes={changes}
                      tags={initTags}
                      onReload={() => loadTags(i.initiativeId)}
                      onToast={onToast}
                    />
                    <Kanban
                      orgId={orgId}
                      teamId={teamId}
                      strategyId={strategyId}
                      initiativeId={i.initiativeId}
                      items={initItems}
                      accentColor={accentColor}
                      onReload={() => loadItems(i.initiativeId)}
                      onToast={onToast}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function TagsRow({ orgId, initiativeId, changes, tags, onReload, onToast }) {
  const [open, setOpen] = useState(false);
  const [tagging, setTagging] = useState(null); // envChangeId currently being submitted/removed

  const taggedIds = new Set(tags.map((t) => t.envChangeId));
  const available = (changes || []).filter((c) => !taggedIds.has(c.envChangeId));

  const addTag = async (change) => {
    setTagging(change.envChangeId);
    const r = await api.initiativeEnvChangeTags.create(initiativeId, orgId, change.envChangeId, change.envChangeTitle);
    setTagging(null);
    if (!r.ok) return onToast?.(r.body?.error || r.error || "Failed to tag change", "err");
    setOpen(false);
    await onReload();
  };

  const removeTag = async (tag) => {
    setTagging(tag.envChangeId);
    const r = await api.initiativeEnvChangeTags.remove(initiativeId, tag.envChangeId);
    setTagging(null);
    if (!r.ok) return onToast?.(r.body?.error || r.error || "Failed to remove tag", "err");
    await onReload();
  };

  return (
    <div className="mb-3 flex flex-wrap items-center gap-1.5" data-testid={`tags-${initiativeId}`}>
      {tags.map((t) => {
        const match = (changes || []).find((c) => c.envChangeId === t.envChangeId);
        const color = match ? quadrantColor[toQuadrant(match.category)] : "var(--muted-foreground)";
        return (
          <span
            key={t.envChangeId}
            className="group inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium"
            style={{ borderColor: `color-mix(in oklch, ${color} 45%, transparent)`, color, background: `color-mix(in oklch, ${color} 12%, transparent)` }}
            data-testid={`tag-${initiativeId}-${t.envChangeId}`}
          >
            <Tag size={9} /> {t.envChangeTitle}
            <button
              type="button"
              disabled={tagging === t.envChangeId}
              onClick={() => removeTag(t)}
              className="ml-0.5 rounded-full opacity-60 transition hover:opacity-100 disabled:opacity-30"
              title="Remove tag"
              data-testid={`remove-tag-${initiativeId}-${t.envChangeId}`}
            >
              <X size={10} />
            </button>
          </span>
        );
      })}

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground hover:bg-accent hover:text-foreground transition"
          data-testid={`add-tag-${initiativeId}`}
        >
          <Plus size={10} /> Tag change
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <ul
              role="listbox"
              className="absolute left-0 top-[calc(100%+4px)] z-50 max-h-64 w-64 overflow-auto rounded-lg border border-border bg-popover shadow-2xl fade-up"
              data-testid={`tag-menu-${initiativeId}`}
            >
              {available.length === 0 ? (
                <li className="px-3 py-2 text-[11px] text-muted-foreground">
                  {(changes || []).length === 0 ? "No environmental changes yet." : "All changes already tagged."}
                </li>
              ) : (
                available.map((c) => (
                  <li key={c.envChangeId}>
                    <button
                      type="button"
                      disabled={tagging === c.envChangeId}
                      onClick={() => addTag(c)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition hover:bg-accent disabled:opacity-50"
                      data-testid={`tag-option-${initiativeId}-${c.envChangeId}`}
                    >
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: quadrantColor[toQuadrant(c.category)] }}
                      />
                      <span className="flex-1 truncate">{c.envChangeTitle}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function Kanban({ orgId, teamId, strategyId, initiativeId, items, accentColor, onReload, onToast }) {
  return (
    <div className="grid grid-flow-col auto-cols-[minmax(200px,1fr)] gap-3 overflow-x-auto pb-1" data-testid={`kanban-${initiativeId}`}>
      {VALID_INITIATIVE_ITEM_STEPS.map((step, idx) => (
        <StepColumn
          key={step}
          step={step}
          index={idx}
          totalSteps={VALID_INITIATIVE_ITEM_STEPS.length}
          items={items.filter((it) => it.step === step)}
          accentColor={accentColor}
          onAdd={async (content) => {
            const r = await api.initiativeItems.create(orgId, teamId, strategyId, initiativeId, step, content);
            if (!r.ok) return onToast?.(r.body?.error || r.error || "Failed to add", "err");
            await onReload();
          }}
          onUpdate={async (item, content) => {
            const r = await api.initiativeItems.update(orgId, teamId, strategyId, initiativeId, item.itemId, step, content);
            if (!r.ok) return onToast?.(r.body?.error || r.error || "Failed to update", "err");
            await onReload();
          }}
          onDelete={async (item) => {
            if (!window.confirm("Delete this item?")) return;
            const r = await api.initiativeItems.remove(orgId, teamId, strategyId, initiativeId, item.itemId);
            if (!r.ok) return onToast?.(r.body?.error || r.error || "Failed to delete", "err");
            await onReload();
          }}
        />
      ))}
    </div>
  );
}

function StepColumn({ step, index, totalSteps, items, accentColor, onAdd, onUpdate, onDelete }) {
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState(null);
  const isLast = index === totalSteps - 1;

  return (
    <div className="relative flex min-h-[220px] flex-col rounded-lg border border-border bg-card">
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
        <div className="mt-0.5 text-[10px] font-mono tabular-nums text-muted-foreground">
          {items.length} item{items.length === 1 ? "" : "s"}
        </div>
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
      className="flex items-center gap-2 rounded-md border border-border bg-card px-2 py-2"
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
