import { useState } from "react";
import { ChevronDown, Target } from "lucide-react";
import { InitiativesList } from "./InitiativesList";
import { STRATEGY_STATES, strategyStateMeta, toStrategyState } from "../lib/strategy-model";

/**
 * StrategyTile — one card per strategy.
 * Header: icon + name/timeframe + state chip + expand chevron.
 * Body:  InitiativesList (each initiative is a collapsible row with its
 *        4-step kanban inside).
 */
export function StrategyTile({
  orgId, teamId, strategy, accentColor, expanded, onToggle, onStateChange, onToast,
}) {
  const state = toStrategyState(strategy.strategyState);
  const dim = state === "OBSOLETE" || state === "DELETED" || state === "COMPLETE";

  return (
    <div
      className={`rounded-2xl border bg-card transition ${dim ? "opacity-70" : ""} ${expanded ? "border-border-strong shadow-xl" : "border-border"}`}
      style={expanded
        ? { boxShadow: `0 0 0 1px color-mix(in oklch, ${accentColor} 40%, transparent), 0 12px 40px -18px color-mix(in oklch, ${accentColor} 45%, transparent)` }
        : undefined}
      data-testid={`strategy-tile-${strategy.strategyId}`}
    >
      <button
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: `color-mix(in oklch, ${accentColor} 18%, transparent)`,
            boxShadow: `inset 0 0 0 1px color-mix(in oklch, ${accentColor} 55%, transparent)`,
          }}
        >
          <Target size={18} style={{ color: accentColor }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className={`text-[15px] font-semibold truncate ${state === "OBSOLETE" || state === "DELETED" ? "line-through decoration-muted-foreground" : ""}`}>
            {strategy.strategyName}
          </div>
          {strategy.strategyTimeframe && (
            <div className="text-[10px] font-mono tabular-nums uppercase tracking-[0.14em] text-muted-foreground">
              {strategy.strategyTimeframe}
            </div>
          )}
        </div>
        <StateChip
          state={state}
          accentColor={accentColor}
          onChange={onStateChange}
          testId={`state-chip-${strategy.strategyId}`}
        />
        <ChevronDown
          size={16}
          className="text-muted-foreground transition"
          style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3 fade-up">
          <InitiativesList
            orgId={orgId}
            teamId={teamId}
            strategy={strategy}
            accentColor={accentColor}
            onToast={onToast}
          />
        </div>
      )}
    </div>
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
