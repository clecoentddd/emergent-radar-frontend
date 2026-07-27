import { useMemo, useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { api } from "../lib/stradar-api";
import { StrategyTile } from "./StrategyTile";
import { strategyStateMeta, toStrategyState } from "../lib/strategy-model";

/**
 * StrategyList — strategies grouped by state; each strategy is its own tile.
 * Groups:
 *   Active   → emphasized
 *   Draft    → default
 *   History  → Complete / Obsolete / Deleted (collapsed by default)
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
      else history.push(s);
    });
    return { active, draft, history };
  }, [strategies]);

  const renderTile = (s) => (
    <StrategyTile
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
    <div className="space-y-8" data-testid="strategy-groups">
      {/* Top action */}
      <div className="flex justify-end">
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
        <TilesSkeleton />
      ) : strategies.length === 0 ? (
        <EmptyState onCreate={onCreate} accentColor={accentColor} />
      ) : (
        <>
          <StrategyGroup label="Active" count={groups.active.length} accentColor={accentColor} emphasize>
            {groups.active.length > 0
              ? <div className="space-y-3">{groups.active.map(renderTile)}</div>
              : <MutedNote>No active strategy.</MutedNote>}
          </StrategyGroup>

          <StrategyGroup label="Draft" count={groups.draft.length} accentColor={accentColor}>
            {groups.draft.length > 0
              ? <div className="space-y-3">{groups.draft.map(renderTile)}</div>
              : <MutedNote>No draft.</MutedNote>}
          </StrategyGroup>

          {groups.history.length > 0 && (
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
                  <span className="text-[10px] font-mono tabular-nums text-muted-foreground">· {groups.history.length}</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {historyOpen ? "Hide" : "Show"}
                </span>
              </button>
              {historyOpen && (
                <div className="space-y-3 fade-up" data-testid="history-list">
                  {groups.history.map(renderTile)}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StrategyGroup({ label, count, accentColor, emphasize, children }) {
  return (
    <div data-testid={`group-${label.toLowerCase()}`}>
      <div className="mb-3 flex items-baseline gap-2">
        <div
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: emphasize ? accentColor : "var(--muted-foreground)" }}
        />
        <span className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${emphasize ? "text-foreground" : "text-muted-foreground"}`}>
          {label}
        </span>
        <span className="text-[10px] font-mono tabular-nums text-muted-foreground">· {count}</span>
      </div>
      {children}
    </div>
  );
}

function MutedNote({ children }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
      {children}
    </div>
  );
}

function EmptyState({ onCreate, accentColor }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-10 text-center" data-testid="strategies-empty">
      <div className="text-sm font-medium">No strategies yet</div>
      <div className="mt-1 text-xs text-muted-foreground">Draft your first strategy to organise initiatives.</div>
      <button
        onClick={onCreate}
        className="mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground transition"
        style={{ background: accentColor }}
      >
        <Plus size={12} /> New strategy
      </button>
    </div>
  );
}

function TilesSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1].map((i) => (
        <div key={i} className="h-16 animate-pulse rounded-2xl border border-border bg-card" />
      ))}
    </div>
  );
}
