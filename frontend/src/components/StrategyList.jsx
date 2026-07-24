import { useMemo, useState } from "react";
import { ChevronRight, Plus, Target } from "lucide-react";
import { api } from "../lib/stradar-api";
import { InitiativeBoard } from "./InitiativeBoard";
import { STRATEGY_STATES, strategyStateMeta, toStrategyState } from "../lib/strategy-model";

/**
 * StrategyList — inline strategy rows with expand-to-board.
 * Restrained palette: only the strategy accent color; state is signaled via
 * icon + weight + opacity (no color per state).
 */
export function StrategyList({
  orgId, teamId, strategies, accentColor, onCreate, onReload, onToast, loading,
}) {
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("visible"); // "visible" | "all"

  const filtered = useMemo(() => {
    if (filter === "all") return strategies;
    return strategies.filter((s) => {
      const st = toStrategyState(s.strategyState);
      return st !== "DELETED" && st !== "OBSOLETE";
    });
  }, [strategies, filter]);

  const activeCount = strategies.filter((s) => toStrategyState(s.strategyState) === "ACTIVE").length;
  const draftCount = strategies.filter((s) => toStrategyState(s.strategyState) === "DRAFT").length;
  const doneCount = strategies.filter((s) => toStrategyState(s.strategyState) === "COMPLETE").length;

  return (
    <>
      {/* Header row: KPIs + filter + new */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-mono tabular-nums">
          <span data-testid="strategies-count-active"><span className="text-foreground text-sm font-semibold">{activeCount}</span> active</span>
          <span data-testid="strategies-count-draft"><span className="text-foreground text-sm font-semibold">{draftCount}</span> draft</span>
          <span data-testid="strategies-count-complete"><span className="text-foreground text-sm font-semibold">{doneCount}</span> complete</span>
          <span className="text-muted-foreground/60">/</span>
          <span><span className="text-foreground text-sm font-semibold">{strategies.length}</span> total</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-border p-1 text-[11px]" role="tablist">
            <button
              onClick={() => setFilter("visible")}
              aria-selected={filter === "visible"}
              className={`rounded-full px-2.5 py-0.5 uppercase tracking-wider transition ${filter === "visible" ? "bg-accent text-foreground" : "text-muted-foreground"}`}
              data-testid="strategy-filter-visible"
            >
              In use
            </button>
            <button
              onClick={() => setFilter("all")}
              aria-selected={filter === "all"}
              className={`rounded-full px-2.5 py-0.5 uppercase tracking-wider transition ${filter === "all" ? "bg-accent text-foreground" : "text-muted-foreground"}`}
              data-testid="strategy-filter-all"
            >
              Show all
            </button>
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
      </div>

      {loading ? (
        <StrategyListSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          hasHidden={strategies.length > 0}
          onCreate={onCreate}
          onShowAll={() => setFilter("all")}
          accentColor={accentColor}
        />
      ) : (
        <ul className="space-y-2" data-testid="strategy-rows">
          {filtered.map((s) => (
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
          ))}
        </ul>
      )}
    </>
  );
}

function StrategyRow({ orgId, teamId, strategy, accentColor, expanded, onToggle, onStateChange, onToast }) {
  const state = toStrategyState(strategy.strategyState);
  const dim = state === "OBSOLETE" || state === "DELETED" || state === "COMPLETE";

  return (
    <li className="overflow-hidden rounded-xl border border-border bg-card" data-testid={`strategy-row-${strategy.strategyId}`}>
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-accent/30 ${dim ? "opacity-60" : ""}`}
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
            className="absolute right-0 top-full z-50 mt-1.5 w-44 overflow-hidden rounded-lg border border-border bg-popover shadow-2xl fade-up"
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

function EmptyState({ hasHidden, onCreate, onShowAll, accentColor }) {
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
        {hasHidden && (
          <button
            onClick={onShowAll}
            className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition"
          >
            Show archived
          </button>
        )}
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
