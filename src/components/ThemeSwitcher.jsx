import { useEffect, useState } from "react";
import { THEME_LIST, applyTheme, getStoredTheme } from "../lib/themes";
import { Palette, Check } from "lucide-react";

/**
 * Small header dropdown for switching themes.
 * Persists selection in localStorage and applies CSS variables to :root.
 */
export function ThemeSwitcher() {
  const [current, setCurrent] = useState(getStoredTheme());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    applyTheme(current);
  }, [current]);

  function pick(id) {
    setCurrent(id);
    setOpen(false);
  }

  const active = THEME_LIST.find((t) => t.id === current) || THEME_LIST[0];

  return (
    <div className="relative" data-testid="theme-switcher">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 hover:bg-accent transition"
        aria-haspopup="listbox"
        aria-expanded={open}
        data-testid="theme-switcher-btn"
      >
        <Palette size={12} />
        <span className="hidden sm:inline">{active.label}</span>
        <span className="flex gap-0.5">
          {active.swatch.map((c, i) => (
            <span key={i} className="h-2.5 w-2.5 rounded-full ring-1 ring-white/20" style={{ background: c }} />
          ))}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <ul
            role="listbox"
            className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-popover shadow-2xl fade-up"
            data-testid="theme-switcher-menu"
          >
            {THEME_LIST.map((t) => (
              <li key={t.id}>
                <button
                  role="option"
                  aria-selected={t.id === current}
                  onClick={() => pick(t.id)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-accent ${
                    t.id === current ? "bg-accent/60" : ""
                  }`}
                  data-testid={`theme-option-${t.id}`}
                >
                  <span className="flex gap-1">
                    {t.swatch.map((c, i) => (
                      <span key={i} className="h-4 w-4 rounded-full ring-1 ring-white/20" style={{ background: c }} />
                    ))}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium">{t.label}</span>
                    <span className="block text-[11px] text-muted-foreground">{t.description}</span>
                  </span>
                  {t.id === current && <Check size={14} className="text-primary" />}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
