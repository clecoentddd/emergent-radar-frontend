// -----------------------------------------------------------------------------
//  All app themes in one place.
//
//  Every theme lists the CSS variables that shape the *chrome*: background,
//  cards, text, buttons, borders, section accents. Radar semantic colors
//  (--impact-high/medium/low + quadrant colors) are intentionally kept identical
//  across themes so the radar always reads the same way.
//
//  Add a new theme by adding an entry to `THEMES`; it will appear automatically
//  in the theme switcher.
// -----------------------------------------------------------------------------

const RADAR_SEMANTIC = {
  // Impact — green (LOW) / amber (MEDIUM) / red (HIGH). Do not change.
  "--impact-high":   "oklch(0.68 0.24 25)",
  "--impact-medium": "oklch(0.82 0.17 75)",
  "--impact-low":    "oklch(0.76 0.19 145)",

  // Quadrants — kept identical across themes to preserve radar semantics.
  "--q-business":     "oklch(0.72 0.20 265)",
  "--q-capabilities": "oklch(0.78 0.16 195)",
  "--q-people":       "oklch(0.76 0.18 320)",
  "--q-knowledge":    "oklch(0.80 0.16 100)",
};

export const THEMES = {
  aurora: {
    id: "aurora",
    label: "Aurora",
    kind: "dark",
    description: "Deep space cyan · original theme",
    swatch: ["oklch(0.82 0.15 195)", "oklch(0.74 0.19 305)", "oklch(0.82 0.17 75)"],
    vars: {
      "--background":       "oklch(0.13 0.015 260)",
      "--surface":          "oklch(0.18 0.02 260)",
      "--card":             "oklch(0.22 0.025 258)",
      "--card-elevated":    "oklch(0.26 0.03 258)",
      "--foreground":       "oklch(0.98 0.005 240)",
      "--card-foreground":  "oklch(0.98 0.005 240)",
      "--popover":          "oklch(0.24 0.028 258)",
      "--popover-foreground": "oklch(0.98 0.005 240)",
      "--primary":          "oklch(0.82 0.15 195)",
      "--primary-foreground": "oklch(0.12 0.03 260)",
      "--secondary":        "oklch(0.30 0.035 258)",
      "--secondary-foreground": "oklch(0.98 0.005 240)",
      "--muted":            "oklch(0.26 0.025 258)",
      "--muted-foreground": "oklch(0.78 0.02 240)",
      "--accent":           "oklch(0.34 0.06 245)",
      "--accent-foreground": "oklch(0.98 0.005 240)",
      "--destructive":      "oklch(0.68 0.22 25)",
      "--destructive-foreground": "oklch(0.98 0.005 240)",
      "--border":           "oklch(0.38 0.035 250 / 60%)",
      "--border-strong":    "oklch(0.48 0.05 250 / 80%)",
      "--input":            "oklch(0.28 0.03 250)",
      "--ring":             "oklch(0.82 0.15 195)",

      "--radar-bg":         "oklch(0.14 0.028 260)",
      "--radar-bg-inner":   "oklch(0.10 0.03 250)",
      "--radar-grid":       "oklch(0.65 0.09 200 / 45%)",
      "--radar-sweep":      "oklch(0.82 0.15 195 / 30%)",

      "--section-team":     "oklch(0.80 0.15 195)",
      "--section-strategy": "oklch(0.74 0.19 305)",
      "--section-changes":  "oklch(0.82 0.17 75)",

      "--page-glow-1":      "radial-gradient(ellipse at top left, oklch(0.24 0.06 260) 0%, transparent 45%)",
      "--page-glow-2":      "radial-gradient(circle at 85% 85%, oklch(0.22 0.10 195 / 35%) 0%, transparent 40%)",
      "--page-glow-3":      "radial-gradient(circle at 15% 90%, oklch(0.22 0.10 305 / 25%) 0%, transparent 40%)",
    },
  },

  sunset: {
    id: "sunset",
    label: "Sunset",
    kind: "dark",
    description: "Warm coral · sun-baked terracotta",
    swatch: ["oklch(0.74 0.18 35)", "oklch(0.72 0.17 320)", "oklch(0.82 0.17 75)"],
    vars: {
      "--background":       "oklch(0.14 0.02 30)",
      "--surface":          "oklch(0.19 0.025 28)",
      "--card":             "oklch(0.23 0.03 28)",
      "--card-elevated":    "oklch(0.28 0.035 28)",
      "--foreground":       "oklch(0.98 0.01 60)",
      "--card-foreground":  "oklch(0.98 0.01 60)",
      "--popover":          "oklch(0.25 0.035 28)",
      "--popover-foreground": "oklch(0.98 0.01 60)",
      "--primary":          "oklch(0.74 0.18 35)",
      "--primary-foreground": "oklch(0.14 0.03 30)",
      "--secondary":        "oklch(0.32 0.045 28)",
      "--secondary-foreground": "oklch(0.98 0.01 60)",
      "--muted":            "oklch(0.28 0.03 28)",
      "--muted-foreground": "oklch(0.78 0.02 60)",
      "--accent":           "oklch(0.36 0.08 40)",
      "--accent-foreground": "oklch(0.98 0.01 60)",
      "--destructive":      "oklch(0.62 0.20 15)",
      "--destructive-foreground": "oklch(0.98 0.01 60)",
      "--border":           "oklch(0.42 0.05 30 / 55%)",
      "--border-strong":    "oklch(0.55 0.09 30 / 80%)",
      "--input":            "oklch(0.30 0.035 28)",
      "--ring":             "oklch(0.74 0.18 35)",

      "--radar-bg":         "oklch(0.14 0.02 28)",
      "--radar-bg-inner":   "oklch(0.10 0.025 25)",
      "--radar-grid":       "oklch(0.60 0.10 40 / 45%)",
      "--radar-sweep":      "oklch(0.74 0.18 35 / 30%)",

      "--section-team":     "oklch(0.74 0.18 35)",   // coral
      "--section-strategy": "oklch(0.72 0.17 320)",  // magenta
      "--section-changes":  "oklch(0.82 0.17 75)",   // amber

      "--page-glow-1":      "radial-gradient(ellipse at top left, oklch(0.28 0.10 40) 0%, transparent 45%)",
      "--page-glow-2":      "radial-gradient(circle at 85% 85%, oklch(0.24 0.10 320 / 30%) 0%, transparent 45%)",
      "--page-glow-3":      "radial-gradient(circle at 15% 95%, oklch(0.22 0.08 90 / 25%) 0%, transparent 40%)",
    },
  },

  botanical: {
    id: "botanical",
    label: "Botanical",
    kind: "dark",
    description: "Deep forest · moss & copper",
    swatch: ["oklch(0.72 0.14 145)", "oklch(0.74 0.16 55)", "oklch(0.72 0.14 290)"],
    vars: {
      "--background":       "oklch(0.13 0.02 155)",
      "--surface":          "oklch(0.18 0.025 155)",
      "--card":             "oklch(0.22 0.03 152)",
      "--card-elevated":    "oklch(0.27 0.035 152)",
      "--foreground":       "oklch(0.97 0.015 100)",
      "--card-foreground":  "oklch(0.97 0.015 100)",
      "--popover":          "oklch(0.24 0.035 152)",
      "--popover-foreground": "oklch(0.97 0.015 100)",
      "--primary":          "oklch(0.72 0.14 145)",
      "--primary-foreground": "oklch(0.14 0.03 155)",
      "--secondary":        "oklch(0.32 0.04 150)",
      "--secondary-foreground": "oklch(0.97 0.015 100)",
      "--muted":            "oklch(0.28 0.03 150)",
      "--muted-foreground": "oklch(0.78 0.03 100)",
      "--accent":           "oklch(0.36 0.06 150)",
      "--accent-foreground": "oklch(0.97 0.015 100)",
      "--destructive":      "oklch(0.62 0.22 25)",
      "--destructive-foreground": "oklch(0.97 0.015 100)",
      "--border":           "oklch(0.40 0.045 150 / 55%)",
      "--border-strong":    "oklch(0.52 0.07 145 / 80%)",
      "--input":            "oklch(0.28 0.035 150)",
      "--ring":             "oklch(0.72 0.14 145)",

      "--radar-bg":         "oklch(0.13 0.02 152)",
      "--radar-bg-inner":   "oklch(0.10 0.025 150)",
      "--radar-grid":       "oklch(0.58 0.10 150 / 45%)",
      "--radar-sweep":      "oklch(0.72 0.14 145 / 30%)",

      "--section-team":     "oklch(0.72 0.14 145)",   // moss
      "--section-strategy": "oklch(0.74 0.16 55)",    // copper
      "--section-changes":  "oklch(0.72 0.14 290)",   // lilac

      "--page-glow-1":      "radial-gradient(ellipse at top left, oklch(0.24 0.08 150) 0%, transparent 45%)",
      "--page-glow-2":      "radial-gradient(circle at 88% 85%, oklch(0.22 0.10 55 / 25%) 0%, transparent 45%)",
      "--page-glow-3":      "radial-gradient(circle at 15% 95%, oklch(0.20 0.08 290 / 22%) 0%, transparent 40%)",
    },
  },

  paper: {
    id: "paper",
    label: "Paper",
    kind: "light",
    description: "Editorial light · cobalt on cream",
    swatch: ["oklch(0.42 0.16 265)", "oklch(0.55 0.13 175)", "oklch(0.62 0.18 30)"],
    vars: {
      "--background":       "oklch(0.97 0.005 90)",
      "--surface":          "oklch(0.99 0.004 90)",
      "--card":             "oklch(1 0 0)",
      "--card-elevated":    "oklch(0.98 0.005 90)",
      "--foreground":       "oklch(0.20 0.02 260)",
      "--card-foreground":  "oklch(0.20 0.02 260)",
      "--popover":          "oklch(1 0 0)",
      "--popover-foreground": "oklch(0.20 0.02 260)",
      "--primary":          "oklch(0.42 0.16 265)",
      "--primary-foreground": "oklch(0.98 0.005 90)",
      "--secondary":        "oklch(0.92 0.01 90)",
      "--secondary-foreground": "oklch(0.20 0.02 260)",
      "--muted":            "oklch(0.94 0.01 90)",
      "--muted-foreground": "oklch(0.45 0.02 260)",
      "--accent":           "oklch(0.90 0.02 265)",
      "--accent-foreground": "oklch(0.20 0.02 260)",
      "--destructive":      "oklch(0.58 0.22 25)",
      "--destructive-foreground": "oklch(0.99 0.005 90)",
      "--border":           "oklch(0.80 0.015 260 / 80%)",
      "--border-strong":    "oklch(0.65 0.02 260 / 90%)",
      "--input":            "oklch(0.97 0.008 90)",
      "--ring":             "oklch(0.42 0.16 265)",

      "--radar-bg":         "oklch(0.98 0.005 90)",
      "--radar-bg-inner":   "oklch(0.92 0.01 260)",
      "--radar-grid":       "oklch(0.55 0.05 260 / 35%)",
      "--radar-sweep":      "oklch(0.42 0.16 265 / 22%)",

      "--section-team":     "oklch(0.42 0.16 265)",   // cobalt
      "--section-strategy": "oklch(0.55 0.13 175)",   // teal
      "--section-changes":  "oklch(0.62 0.18 30)",    // burnt orange

      "--page-glow-1":      "radial-gradient(ellipse at top left, oklch(0.94 0.03 265) 0%, transparent 55%)",
      "--page-glow-2":      "radial-gradient(circle at 85% 85%, oklch(0.94 0.03 175) 0%, transparent 45%)",
      "--page-glow-3":      "radial-gradient(circle at 15% 95%, oklch(0.94 0.03 30) 0%, transparent 45%)",
    },
  },
};

export const THEME_LIST = Object.values(THEMES);
export const DEFAULT_THEME = "aurora";
const LS_KEY = "stradar.theme";

export function getStoredTheme() {
  if (typeof window === "undefined") return DEFAULT_THEME;
  const t = localStorage.getItem(LS_KEY);
  return t && THEMES[t] ? t : DEFAULT_THEME;
}

export function applyTheme(themeId) {
  if (typeof window === "undefined") return;
  const theme = THEMES[themeId] || THEMES[DEFAULT_THEME];
  const root = document.documentElement;
  // Merge chrome vars + fixed radar semantics
  const vars = { ...theme.vars, ...RADAR_SEMANTIC };
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  root.dataset.theme = theme.id;
  root.dataset.themeKind = theme.kind;
  try { localStorage.setItem(LS_KEY, theme.id); } catch {}
}
