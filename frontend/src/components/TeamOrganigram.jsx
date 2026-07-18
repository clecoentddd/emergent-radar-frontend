import { useMemo } from "react";
import { Users, ChevronRight, Plus } from "lucide-react";

/**
 * TeamOrganigram — Tiered top-down company chart.
 * Organization at the top, then teams grouped by Level (0 → 1 → 2 → …),
 * each level rendered as its own row of cards connected by spines and busses.
 */
export function TeamOrganigram({ organization, teams, onSelectTeam, onCreateTeam }) {
  const teamName = (t) => t.teamName || t.Name || "(unnamed team)";

  // Group teams by Level (default 0), then sort levels ascending
  const tiers = useMemo(() => {
    const byLevel = new Map();
    teams.forEach((t) => {
      const lvl = Number.isFinite(Number(t.Level)) ? Number(t.Level) : 0;
      if (!byLevel.has(lvl)) byLevel.set(lvl, []);
      byLevel.get(lvl).push(t);
    });
    return [...byLevel.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([level, list]) => ({ level, teams: list }));
  }, [teams]);

  if (teams.length === 0) {
    return (
      <div className="relative fade-up" data-testid="team-organigram">
        <OrgNode organization={organization} totalTeams={0} />
        <div className="mx-auto h-10 w-px bg-gradient-to-b from-primary/60 to-transparent" />
        <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center">
          <div className="mb-2 text-sm text-muted-foreground">No teams under this organization yet.</div>
          <button
            onClick={onCreateTeam}
            className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground btn-glow hover:brightness-110 transition"
            data-testid="create-first-team-btn"
          >
            <Plus size={14} /> Create your first team
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative fade-up" data-testid="team-organigram">
      <OrgNode organization={organization} totalTeams={teams.length} />
      {/* Spine from org to first tier */}
      <div className="mx-auto h-8 w-px bg-gradient-to-b from-primary/60 to-primary/30" />

      {tiers.map((tier, tierIdx) => (
        <div key={tier.level} className="relative" data-testid={`tier-level-${tier.level}`}>
          {/* Tier label chip */}
          <div className="mb-3 flex justify-center">
            <span
              className="rounded-full border border-border-strong bg-card-elevated px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: "var(--section-team)" }}
              data-testid={`tier-label-${tier.level}`}
            >
              Level {tier.level} · {tier.teams.length} team{tier.teams.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Horizontal bus above the row (only when >1 card in tier) */}
          <div className="relative mx-auto grid max-w-6xl gap-6 px-2" style={{ gridTemplateColumns: `repeat(${Math.min(Math.max(tier.teams.length, 1), 4)}, minmax(220px, 1fr))` }}>
            {tier.teams.length > 1 && (
              <div className="pointer-events-none absolute left-[10%] right-[10%] -top-3 h-px bg-primary/40" />
            )}
            {tier.teams.map((t) => (
              <div key={t.teamId} className="relative">
                {/* Drop connector down to card */}
                <div className="absolute left-1/2 -top-3 h-3 w-px -translate-x-1/2 bg-primary/40" />
                <button
                  onClick={() => onSelectTeam(t)}
                  className="card-lift w-full text-left rounded-2xl border border-border bg-card p-4 group"
                  data-testid={`team-card-${t.teamId}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/15 ring-1 ring-primary/40 flex items-center justify-center">
                        <Users size={15} className="text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold tracking-tight">{teamName(t)}</div>
                        <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                          {t.Context || "—"}
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition" />
                  </div>
                  {t.Purpose && (
                    <div className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                      {t.Purpose}
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                      style={{ color: "var(--section-team)" }}
                    >
                      L{tier.level}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary opacity-0 group-hover:opacity-100 transition">
                      Open →
                    </span>
                  </div>
                </button>
              </div>
            ))}
          </div>

          {/* Spine from this tier to the next */}
          {tierIdx < tiers.length - 1 && (
            <div className="mx-auto my-6 h-8 w-px bg-gradient-to-b from-primary/40 to-primary/20" />
          )}
        </div>
      ))}

      <div className="mt-10 flex justify-center">
        <button
          onClick={onCreateTeam}
          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-primary/50 bg-primary/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary hover:bg-primary/10 transition"
          data-testid="add-team-btn"
        >
          <Plus size={14} /> Add team
        </button>
      </div>
    </div>
  );
}

function OrgNode({ organization, totalTeams }) {
  return (
    <div className="flex justify-center">
      <div
        className="relative overflow-hidden rounded-2xl border border-primary/50 bg-gradient-to-br from-primary/20 via-card to-card px-8 py-5 shadow-xl"
        data-testid="org-node"
      >
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
        <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Organization</div>
        <div className="mt-1 text-xl font-semibold tracking-tight">{organization.organizationName}</div>
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Users size={12} /> {totalTeams} team{totalTeams === 1 ? "" : "s"}
        </div>
      </div>
    </div>
  );
}
