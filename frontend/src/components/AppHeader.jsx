import { useNavigate } from "react-router-dom";
import { clearAllAuth, getConfig } from "../lib/stradar-api";
import { RadarLogo } from "./RadarLogo";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { LogOut, ArrowLeftRight } from "lucide-react";

export function AppHeader({ organizationName, onSwitchOrg, breadcrumbs = [], right = null }) {
  const navigate = useNavigate();
  const cfg = getConfig();

  function logout() {
    clearAllAuth();
    window.location.href = "/login";
  }

  return (
    <header
      className="glass sticky top-0 z-30 flex items-center justify-between border-b border-border px-6 py-3"
      data-testid="app-header"
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/organizations")}
          className="flex items-center gap-2.5 group"
          data-testid="header-logo"
        >
          <div className="h-9 w-9 rounded-full ring-1 ring-primary/60 bg-primary/10 flex items-center justify-center group-hover:ring-primary transition">
            <RadarLogo size={22} />
          </div>
          <div className="text-left">
            <div className="text-[13px] font-semibold tracking-[0.14em]">STRADAR</div>
            <div className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
              Environmental Radar
            </div>
          </div>
        </button>

        {breadcrumbs.length > 0 && (
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground pl-4 border-l border-border" data-testid="breadcrumbs">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="opacity-40">/</span>}
                {b.to ? (
                  <button onClick={() => navigate(b.to)} className="hover:text-foreground transition">
                    {b.label}
                  </button>
                ) : (
                  <span className="text-foreground font-medium">{b.label}</span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs">
        {right}
        <ThemeSwitcher />
        {organizationName && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-background/40">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="tracking-wide">{organizationName}</span>
          </div>
        )}
        {onSwitchOrg && (
          <button
            onClick={onSwitchOrg}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 hover:bg-accent transition btn-glow"
            data-testid="switch-org-btn"
          >
            <ArrowLeftRight size={12} /> Switch
          </button>
        )}
        <span className="hidden md:inline text-muted-foreground max-w-[180px] truncate">{cfg.email}</span>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 hover:bg-destructive/20 hover:border-destructive/40 hover:text-destructive-foreground transition"
          data-testid="logout-btn"
        >
          <LogOut size={12} /> Sign out
        </button>
      </div>
    </header>
  );
}
