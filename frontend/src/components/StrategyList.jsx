import { useMemo, useState } from "react";
import { ChevronRight, Plus, Target, ChevronDown } from "lucide-react";
import { api } from "../lib/stradar-api";
import { InitiativeBoard } from "./InitiativeBoard";
import { STRATEGY_STATES, strategyStateMeta, toStrategyState } from "../lib/strategy-model";

/**
 * StrategyList — inline strategy rows grouped by state:
 *   Active   (0 or 1 expected)
 *   Draft    (0 or 1 expected)
 *   History  (Complete / Obsolete / Deleted) — collapsed by default
 * Restrained palette: only the strategy accent color; state signaled via
 * icon + weight + opacity (no color per state).
 */
export function StrategyList({
  orgId, teamId, strategies, accentColor, onCreate, onReload, onToast, loading,
}) {
  const [expanded, setExpanded] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const groups = useMemo(() => {
    const active = [], draft = [], history = [];
    strategies.forEach((s) => {
      const st = toStrategyState(s.strategyState);
      if (st === "ACTIVE") active.push(s);
      else if (st === "DRAFT") draft.push(s);
      else history.push(s); // COMPLETE / OBSOLETE / DELETED
    });
    return { active, draft, history };
  }, [strategies]);

  const activeCount = groups.active.length;
  const draftCount = groups.draft.length;
  const historyCount = groups.history.length;

  const renderRow = (s) => (
    <StrategyRow
      key={s.strategyId}
      orgId={orgId}
      teamId={teamId}
      strategy={s}
      accentColor={accentColor}
      expanded={expanded === s.strategyId}
      onToggle={() => setExpanded((e) => (e === s.strategyId ? null : s.strategyId))}
      onStateChange={async (state) => {
        const r = await api.strategies.setState(orgId, teamId, s.strategyId, state);
        if (!r.ok) return onToast?.(r.body?.error || r.error || "Failed to update state", "err");
        onToast?.(`Strategy marked ${strategyStateMeta[state].label.toLowerCase()}`);
        onReload?.();
      }}
      onToast={onToast}
    />
  );

  return (
    <>
      {/* Header row: KPIs + new */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-mono tabular-nums">
          <span data-testid="strategies-count-active"><span className="text-foreground text-sm font-semibold">{activeCount}</span> active</span>
          <span data-testid="strategies-count-draft"><span className="text-foreground text-sm font-semibold">{draftCount}</span> draft</span>
          <span data-testid="strategies-count-history"><span className="text-foreground text-sm font-semibold">{historyCount}</span> history</span>
          <span className="text-muted-foreground/60">/</span>
          <span><span className="text-foreground text-sm font-semibold">{strategies.length}</span> total</span>
        </div>
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground transition hover:brightness-110"
          style={{ background: accentColor }}
          data-testid="new-strategy-btn"
        >
          <Plus size={12} /> New strategy
        </button>
      </div>

      {loading ? (
        <StrategyListSkeleton />
      ) : strategies.length === 0 ? (
        <EmptyState onCreate={onCreate} accentColor={accentColor} />
      ) : (
        <div className="space-y-6" data-testid="strategy-groups">
          {/* ACTIVE */}
          <StrategyGroup
            label="Active"
            hint="Currently being executed"
            count={activeCount}
            accentColor={accentColor}
            emphasize
          >
            {groups.active.length > 0 ? (
              <ul className="space-y-2">{groups.active.map(renderRow)}</ul>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                No active strategy yet.
              </div>
            )}
          </StrategyGroup>

          {/* DRAFT */}
          <StrategyGroup
            label="Draft"
            hint="Work in progress"
            count={draftCount}
            accentColor={accentColor}
          >
            {groups.draft.length > 0 ? (
              <ul className="space-y-2">{groups.draft.map(renderRow)}</ul>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                No draft strategy yet.
              </div>
            )}
          </StrategyGroup>

          {/* HISTORY — collapsed by default */}
          {historyCount > 0 && (
            <div>
              <button
                onClick={() => setHistoryOpen((o) => !o)}
                className="mb-3 flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-background/40 px-3 py-2 text-left transition hover:bg-accent/30"
                aria-expanded={historyOpen}
                data-testid="history-toggle"
              >
                <div className="flex items-center gap-2">
                  <ChevronDown
                    size={14}
                    className="text-muted-foreground transition"
                    style={{ transform: historyOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
                  />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">History</span>
                  <span className="text-[10px] font-mono tabular-nums text-muted-foreground">
                    · {historyCount} archived
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {historyOpen ? "Hide" : "Show"}
                </span>
              </button>
              {historyOpen && (
                <ul className="space-y-2 fade-up" data-testid="history-list">
                  {groups.history.map(renderRow)}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function StrategyGroup({ label, hint, count, accentColor, emphasize, children }) {
  return (
    <div data-testid={`group-${label.toLowerCase()}`}>
      <div className="mb-2 flex items-baseline gap-2">
        <div
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: emphasize ? accentColor : "var(--muted-foreground)" }}
        />
        <span className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${emphasize ? "text-foreground" : "text-muted-foreground"}`}>
          {label}
        </span>
        <span className="text-[10px] font-mono tabular-nums text-muted-foreground">
          · {count}
        </span>
        <span className="text-[10px] text-muted-foreground/70 hidden sm:inline">— {hint}</span>
      </div>
      {children}
    </div>
  );
}

function StrategyRow({ orgId, teamId, strategy, accentColor, expanded, onToggle, onStateChange, onToast }) {
  const state = toStrategyState(strategy.strategyState);
  const dim = state === "OBSOLETE" || state === "DELETED" || state === "COMPLETE";

  return (
    <li className="rounded-xl border border-border bg-card" data-testid={`strategy-row-${strategy.strategyId}`}>
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        className={`flex w-full items-center gap-3 rounded-t-xl px-4 py-3 text-left transition hover:bg-accent/30 ${dim ? "opacity-60" : ""} ${expanded ? "" : "rounded-b-xl"}`}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{
            background: `color-mix(in oklch, ${accentColor} 18%, transparent)`,
            boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${accentColor} 55%, transparent)`,
          }}
        >
          <Target size={16} style={{ color: accentColor }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold truncate ${state === "OBSOLETE" || state === "DELETED" ? "line-through decoration-muted-foreground" : ""}`}>
              {strategy.strategyName}
            </span>
          </div>
          {strategy.strategyTimeframe && (
            <div className="text-[10px] font-mono tabular-nums uppercase tracking-[0.14em] text-muted-foreground">
              {strategy.strategyTimeframe}
            </div>
          )}
        </div>
        <StateChip state={state} accentColor={accentColor} onChange={onStateChange} testId={`state-chip-${strategy.strategyId}`} />
        <ChevronRight
          size={16}
          className="text-muted-foreground transition"
          style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}
        />
      </button>

      {expanded && (
        <div className="border-t border-border px-4 py-3">
          <InitiativeBoard
            orgId={orgId}
            teamId={teamId}
            strategy={strategy}
            accentColor={accentColor}
            onToast={onToast}
          />
        </div>
      )}
    </li>
  );
}

function StateChip({ state, accentColor, onChange, testId }) {
  const [open, setOpen] = useState(false);
  const meta = strategyStateMeta[state];
  const Icon = meta.icon;
  const filled = state === "ACTIVE";

  return (
    <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] transition hover:brightness-110"
        style={filled
          ? { background: accentColor, borderColor: accentColor, color: "var(--primary-foreground)" }
          : { borderColor: "var(--border-strong)", background: "transparent", color: "var(--muted-foreground)" }}
        title={meta.hint}
        data-testid={testId}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Icon size={11} />
        {meta.label}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <ul
            role="listbox"
            className="absolute right-0 top-[calc(100%+6px)] z-50 w-52 overflow-hidden rounded-lg border border-border bg-popover shadow-2xl fade-up"
            data-testid={`${testId}-menu`}
          >
            {STRATEGY_STATES.map((s) => {
              const m = strategyStateMeta[s];
              const I = m.icon;
              return (
                <li key={s}>
                  <button
                    onClick={() => { setOpen(false); if (s !== state) onChange(s); }}
                    className={`flex w-full items-center gap-2 px-2.5 py-2 text-xs transition hover:bg-accent ${s === state ? "bg-accent/60" : ""}`}
                    data-testid={`state-option-${s}`}
                  >
                    <I size={12} className="text-muted-foreground" />
                    <span className="flex-1 text-left">
                      <span className="block font-medium">{m.label}</span>
                      <span className="block text-[10px] text-muted-foreground">{m.hint}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

function EmptyState({ onCreate, accentColor }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-10 text-center" data-testid="strategies-empty">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full"
           style={{ background: `color-mix(in oklch, ${accentColor} 15%, transparent)` }}>
        <Target size={18} style={{ color: accentColor }} />
      </div>
      <div className="text-sm font-medium">No strategies in play</div>
      <div className="mt-1 text-xs text-muted-foreground">
        Draft your first strategy to organise initiatives around your radar signals.
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground transition"
          style={{ background: accentColor }}
        >
          <Plus size={12} /> New strategy
        </button>
      </div>
    </div>
  );
}

function StrategyListSkeleton() {
  return (
    <ul className="space-y-2">
      {[0, 1, 2].map((i) => (
        <li key={i} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-2.5 w-1/5 animate-pulse rounded bg-muted/70" />
          </div>
          <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
        </li>
      ))}
    </ul>
  );
}
