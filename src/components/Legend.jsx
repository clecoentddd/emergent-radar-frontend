import { EFFORTS, IMPACTS, effortRadius, impactColor } from "../lib/radar-model";

export function Legend() {
  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur p-4 text-xs" data-testid="legend">
      <div className="mb-3 text-sm font-semibold tracking-wide">Legend</div>
      <div className="space-y-3">
        <div>
          <div className="mb-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Impact · color</div>
          <div className="flex gap-3">
            {IMPACTS.map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full ring-1 ring-white/20" style={{ background: impactColor[i] }} />
                <span>{i}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Effort · size</div>
          <div className="flex items-end gap-3">
            {EFFORTS.slice().reverse().map((e) => (
              <div key={e} className="flex items-center gap-1.5">
                <svg width={effortRadius[e] * 2 + 2} height={effortRadius[e] * 2 + 2}>
                  <circle cx={effortRadius[e] + 1} cy={effortRadius[e] + 1} r={effortRadius[e]} fill="var(--muted-foreground)" />
                </svg>
                <span>{e}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Nature · shape</div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <svg width={18} height={18} viewBox="-9 -9 18 18">
                <polygon points="0,-8 7,5 -7,5" fill="var(--muted-foreground)" />
              </svg>
              <span>Risk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg width={18} height={18} viewBox="-9 -9 18 18">
                <circle r={7} fill="var(--muted-foreground)" />
              </svg>
              <span>Opportunity</span>
            </div>
          </div>
        </div>
        <div>
          <div className="mb-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Lifecycle</div>
          <div className="text-[11px] text-muted-foreground">ANTICIPATING → edge · RESPONDED → center</div>
        </div>
      </div>
    </div>
  );
}
