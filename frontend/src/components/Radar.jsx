import { useMemo, useState } from "react";
import {
  QUADRANTS,
  STATES,
  effortRadius,
  impactColor,
  quadrantAngles,
  quadrantColor,
  stateRatio,
  toEffort,
  toImpact,
  toNature,
  toQuadrant,
  toState,
} from "../lib/radar-model";

export function Radar({
  changes,
  size = 640,
  onSelectChange,
  onSelectQuadrant,
  zoomedQuadrant = null,
}) {
  const [hover, setHover] = useState(null);

  const cx = size / 2;
  const cy = size / 2;
  const R = size / 2 - 80;

  const points = useMemo(() => {
    const visible = changes.filter((c) => stateRatio[toState(c)] > 0);
    const groupCount = {};
    visible.forEach((c) => {
      const key = `${toQuadrant(c.category)}:${toState(c)}`;
      groupCount[key] = (groupCount[key] ?? 0) + 1;
    });
    const groupIdx = {};

    return visible.map((c) => {
      const quadrant = toQuadrant(c.category);
      const state = toState(c);
      const impact = toImpact(c.impact);
      const effort = toEffort(c.effort);
      const nature = toNature(c.nature);

      const ratio = stateRatio[state];
      const [a0, a1] = quadrantAngles[quadrant];
      const span = a1 - a0;

      const key = `${quadrant}:${state}`;
      const count = groupCount[key];
      const idx = groupIdx[key] ?? 0;
      groupIdx[key] = idx + 1;

      const angleDeg = a0 + (idx + 1) * span / (count + 1);
      const angle = (angleDeg * Math.PI) / 180;
      const x = cx + Math.cos(angle) * R * ratio;
      const y = cy - Math.sin(angle) * R * ratio;

      return {
        change: c,
        quadrant,
        x, y,
        color: impactColor[impact],
        radius: effortRadius[effort],
        nature,
        state,
      };
    });
  }, [changes, cx, cy, R]);

  const lx = R * 1.45;
  const ly = R * 0.92;
  const labels = [
    { q: "BUSINESS", label: "BUSINESS", x: cx - lx, y: cy - ly, anchor: "start" },
    { q: "CAPABILITIES", label: "CAPABILITIES", x: cx + lx, y: cy - ly, anchor: "end" },
    { q: "PEOPLE & KNOWLEDGE", label: "PEOPLE & KNOWLEDGE", x: cx + lx, y: cy + ly, anchor: "end" },
    { q: "OPERATING MODEL", label: "OPERATING MODEL", x: cx - lx, y: cy + ly, anchor: "start" },
  ];

  return (
    <div className="relative" data-testid="radar-container">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} overflow="visible">
        <defs>
          <radialGradient id="radarDiskBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--radar-bg)" />
            <stop offset="100%" stopColor="oklch(0.10 0.03 250)" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={R} fill="url(#radarDiskBg)" />

        {QUADRANTS.map((q) => {
          const [a0, a1] = quadrantAngles[q];
          const p0 = polar(cx, cy, R, a0);
          const p1 = polar(cx, cy, R, a1);
          const active = zoomedQuadrant ? zoomedQuadrant === q : true;
          return (
            <path
              key={q}
              d={`M ${cx} ${cy} L ${p0.x} ${p0.y} A ${R} ${R} 0 0 0 ${p1.x} ${p1.y} Z`}
              fill={quadrantColor[q]}
              opacity={active ? 0.06 : 0.02}
              className="cursor-pointer transition-opacity hover:opacity-[0.12]"
              onClick={() => onSelectQuadrant?.(q)}
              data-testid={`radar-quadrant-${q.toLowerCase().replace(/\s|&/g, "-")}`}
            />
          );
        })}

        {STATES.filter((s) => stateRatio[s] > 0).map((s) => (
          <circle
            key={s}
            cx={cx} cy={cy}
            r={R * stateRatio[s]}
            fill="none"
            stroke="var(--radar-grid)"
            strokeWidth={0.75}
            strokeDasharray={s === "ANTICIPATING" ? "0" : "3 4"}
          />
        ))}

        <line x1={cx - R} y1={cy} x2={cx + R} y2={cy} stroke="var(--radar-grid)" strokeWidth={0.75} />
        <line x1={cx} y1={cy - R} x2={cx} y2={cy + R} stroke="var(--radar-grid)" strokeWidth={0.75} />

        {STATES.filter((s) => stateRatio[s] > 0).map((s, i) => (
          <text
            key={s}
            x={cx + 4}
            y={cy - R * stateRatio[s] + (i === 0 ? 14 : -4)}
            fill="var(--muted-foreground)"
            fontSize={10}
            fontFamily="ui-monospace,SFMono-Regular,monospace"
            opacity={0.7}
          >
            {s}
          </text>
        ))}

        {labels.map((l) => (
          <text
            key={l.q}
            x={l.x} y={l.y}
            fill="oklch(0.98 0.005 240)"
            fontSize={14}
            fontWeight={700}
            letterSpacing={2.5}
            textAnchor={l.anchor}
            dominantBaseline="middle"
            className="cursor-pointer select-none"
            onClick={() => onSelectQuadrant?.(l.q)}
          >
            {l.label}
          </text>
        ))}

        <g className="animate-radar-sweep" style={{ transformOrigin: `${cx}px ${cy}px` }}>
          <defs>
            <linearGradient id="sweepGrad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`M ${cx} ${cy} L ${cx + R} ${cy} A ${R} ${R} 0 0 0 ${cx + R * Math.cos(-Math.PI / 6)} ${cy + R * Math.sin(-Math.PI / 6)} Z`}
            fill="url(#sweepGrad)"
          />
        </g>

        {points.map((p, i) => {
          const dim = zoomedQuadrant && zoomedQuadrant !== p.quadrant;
          // Compute label offset — push away from center so the label doesn't overlap the point
          const dx = p.x - cx;
          const dy = p.y - cy;
          const dist = Math.max(1, Math.hypot(dx, dy));
          const ox = (dx / dist) * (p.radius + 5);
          const oy = (dy / dist) * (p.radius + 5);
          const labelX = p.x + ox;
          const labelY = p.y + oy + 3;
          const anchor = ox >= 0 ? "start" : "end";
          const title = p.change.envChangeTitle || "";
          const short = title.length > 26 ? title.slice(0, 24) + "…" : title;
          return (
            <g
              key={p.change.envChangeId || i}
              opacity={dim ? 0.15 : 1}
              className="cursor-pointer"
              onMouseEnter={() => setHover(p)}
              onMouseLeave={() => setHover(null)}
              onClick={() => onSelectChange?.(p.change)}
              data-testid={`radar-point-${p.change.envChangeId || i}`}
            >
              <g transform={`translate(${p.x} ${p.y})`}>
                {p.nature === "OPPORTUNITY" ? (
                  <circle r={p.radius} fill={p.color} stroke="oklch(1 0 0 / 60%)" strokeWidth={1} />
                ) : (
                  <polygon points={trianglePoints(p.radius)} fill={p.color} stroke="oklch(1 0 0 / 60%)" strokeWidth={1} />
                )}
              </g>
              {/* Halo behind label for readability */}
              <text
                x={labelX}
                y={labelY}
                textAnchor={anchor}
                fontSize={10}
                fontFamily='"Space Grotesk", ui-sans-serif, system-ui'
                fill="oklch(0.10 0.02 260)"
                stroke="oklch(0.10 0.02 260)"
                strokeWidth={3}
                strokeOpacity={0.85}
                paintOrder="stroke"
              >
                {short}
              </text>
              <text
                x={labelX}
                y={labelY}
                textAnchor={anchor}
                fontSize={10}
                fontWeight={500}
                fontFamily='"Space Grotesk", ui-sans-serif, system-ui'
                fill="oklch(0.98 0.005 240)"
              >
                {short}
              </text>
            </g>
          );
        })}
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute z-10 rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-lg"
          style={{ left: hover.x + 12, top: hover.y + 12 }}
        >
          <div className="font-semibold text-popover-foreground">{hover.change.envChangeTitle}</div>
          <div className="mt-1 text-muted-foreground">
            {hover.quadrant} · {hover.state} · {toImpact(hover.change.impact)} impact · {toNature(hover.change.nature)}
          </div>
        </div>
      )}
    </div>
  );
}

function polar(cx, cy, r, angleDeg) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: cx + Math.cos(a) * r, y: cy - Math.sin(a) * r };
}

function trianglePoints(r) {
  const h = r * 1.15;
  return `0,${-h} ${h * 0.95},${h * 0.6} ${-h * 0.95},${h * 0.6}`;
}
