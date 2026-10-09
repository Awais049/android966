// Site-wide theme presets. Each theme overrides the CSS variables defined in
// src/styles.css :root, so switching a theme re-skins the entire site.

export type ThemeId =
  | "brand-blue"
  | "paper-ink"
  | "navy-gold"
  | "midnight-emerald"
  | "royal-purple"
  | "crimson-noir"
  | "brutalist-blue"
  | "ocean-breeze"
  | "sunset-warm"
  | "mono-minimal";


export interface ThemeVars {
  background: string;
  foreground: string;
  card: string;
  brand: string;
  brandHover: string;
  brandForeground: string;
  brandSoft: string;
  navy: string;
  navy2: string;
  secondaryLabel: string;
  accentWarm: string;
  accentWarmSoft: string;
  neutral: string;
  bg2: string;
  border: string;
  text: string;
  text2: string;
  peach: string;
  peachSoft: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  input: string;
  ring: string;
}

export interface ThemePreset {
  id: ThemeId;
  label: string;
  description: string;
  swatch: string[];
  vars: ThemeVars;
}

const build = (o: {
  bg: string;
  fg: string;
  brand: string;
  brandHover: string;
  brandFg: string;
  brandSoft: string;
  navy: string;
  navy2: string;
  neutral: string;
  bg2: string;
  border: string;
  text2: string;
  destructive?: string;
}): ThemeVars => ({
  background: o.bg,
  foreground: o.fg,
  card: o.bg,
  brand: o.brand,
  brandHover: o.brandHover,
  brandForeground: o.brandFg,
  brandSoft: o.brandSoft,
  navy: o.navy,
  navy2: o.navy2,
  secondaryLabel: o.navy2,
  accentWarm: o.brandHover,
  accentWarmSoft: o.brandSoft,
  neutral: o.neutral,
  bg2: o.bg2,
  border: o.border,
  text: o.fg,
  text2: o.text2,
  peach: o.brandSoft,
  peachSoft: o.brandSoft,
  primary: o.brand,
  primaryForeground: o.brandFg,
  secondary: o.bg2,
  secondaryForeground: o.fg,
  muted: o.bg2,
  mutedForeground: o.neutral,
  accent: o.brandSoft,
  accentForeground: o.fg,
  destructive: o.destructive ?? "#b3341c",
  destructiveForeground: "#ffffff",
  input: o.bg2,
  ring: o.brand,
});

export const THEMES: ThemePreset[] = [
  {
    id: "brand-blue",
    label: "Brand Blue",
    description: "Signature electric blue on crisp white — the default Android 966 look.",
    swatch: ["#2665fd", "#eef3ff", "#f7f8fa", "#ffffff"],
    vars: build({
      bg: "#ffffff",
      fg: "#1a1a1a",
      brand: "#2665fd",
      brandHover: "#1a50d4",
      brandFg: "#ffffff",
      brandSoft: "#eef3ff",
      navy: "#1a1a1a",
      navy2: "#6074b9",
      neutral: "#757681",
      bg2: "#f7f8fa",
      border: "#e4e5e9",
      text2: "#757681",
      destructive: "#bd3800",
    }),
  },
  {
    id: "paper-ink",
    label: "Paper & Ink",
    description: "Minimal editorial — cream paper with pure ink black.",
    swatch: ["#f5f3ee", "#e8e4dd", "#2d2d2d", "#0d0d0d"],
    vars: build({
      bg: "#f5f3ee",
      fg: "#0d0d0d",
      brand: "#0d0d0d",
      brandHover: "#2d2d2d",
      brandFg: "#f5f3ee",
      brandSoft: "#e8e4dd",
      navy: "#0d0d0d",
      navy2: "#2d2d2d",
      neutral: "#6b6b66",
      bg2: "#e8e4dd",
      border: "#d9d5cc",
      text2: "#4a4a45",
    }),
  },

  {
    id: "navy-gold",
    label: "Navy & Gold",
    description: "Premium dark navy with warm gold accents (default).",
    swatch: ["#0f1b3d", "#c9a84c", "#f7f5ef", "#ffffff"],
    vars: build({
      bg: "#ffffff",
      fg: "#0f1b3d",
      brand: "#c9a84c",
      brandHover: "#b39238",
      brandFg: "#0f1b3d",
      brandSoft: "#faf3dc",
      navy: "#0f1b3d",
      navy2: "#1e3a5f",
      neutral: "#6b7591",
      bg2: "#f7f5ef",
      border: "#e6e2d4",
      text2: "#4a5a7a",
    }),
  },
  {
    id: "midnight-emerald",
    label: "Midnight Emerald",
    description: "Deep charcoal with emerald green highlights.",
    swatch: ["#0b1f1a", "#10b981", "#f1f7f4", "#ffffff"],
    vars: build({
      bg: "#ffffff",
      fg: "#0b1f1a",
      brand: "#10b981",
      brandHover: "#059669",
      brandFg: "#ffffff",
      brandSoft: "#d1fae5",
      navy: "#0b1f1a",
      navy2: "#134e4a",
      neutral: "#64766f",
      bg2: "#f1f7f4",
      border: "#dbe8e2",
      text2: "#3f5a52",
    }),
  },
  {
    id: "royal-purple",
    label: "Royal Purple",
    description: "Regal violet paired with soft lavender surfaces.",
    swatch: ["#2a1454", "#8b5cf6", "#f5f1fb", "#ffffff"],
    vars: build({
      bg: "#ffffff",
      fg: "#2a1454",
      brand: "#8b5cf6",
      brandHover: "#7c3aed",
      brandFg: "#ffffff",
      brandSoft: "#ede9fe",
      navy: "#2a1454",
      navy2: "#4c1d95",
      neutral: "#6c6584",
      bg2: "#f5f1fb",
      border: "#e4dcf3",
      text2: "#4e4267",
    }),
  },
  {
    id: "crimson-noir",
    label: "Crimson Noir",
    description: "Bold black with vivid crimson red.",
    swatch: ["#1a1a1a", "#dc2626", "#f7f4f4", "#ffffff"],
    vars: build({
      bg: "#ffffff",
      fg: "#1a1a1a",
      brand: "#dc2626",
      brandHover: "#b91c1c",
      brandFg: "#ffffff",
      brandSoft: "#fee2e2",
      navy: "#1a1a1a",
      navy2: "#3f0f0f",
      neutral: "#6f5c5c",
      bg2: "#f7f4f4",
      border: "#eadada",
      text2: "#4a3a3a",
    }),
  },
  {
    id: "brutalist-blue",
    label: "Brutalist Blue",
    description: "Neo-brutalist cream & ink with electric blue accents and offset shadows.",
    swatch: ["#fbeee2", "#0a0a0a", "#1e5fff", "#ffffff"],
    vars: build({
      bg: "#fbeee2",
      fg: "#0a0a0a",
      brand: "#1e5fff",
      brandHover: "#1345c9",
      brandFg: "#ffffff",
      brandSoft: "#dce7ff",
      navy: "#0a0a0a",
      navy2: "#1345c9",
      neutral: "#4a4a4a",
      bg2: "#f5e6d6",
      border: "#0a0a0a",
      text2: "#333333",
    }),
  },
  {
    id: "ocean-breeze",
    label: "Ocean Breeze",
    description: "Fresh sky-blue with clean white surfaces.",
    swatch: ["#0c2340", "#0ea5e9", "#eff6fb", "#ffffff"],
    vars: build({
      bg: "#ffffff",
      fg: "#0c2340",
      brand: "#0ea5e9",
      brandHover: "#0284c7",
      brandFg: "#ffffff",
      brandSoft: "#e0f2fe",
      navy: "#0c2340",
      navy2: "#075985",
      neutral: "#5f7391",
      bg2: "#eff6fb",
      border: "#dae6f0",
      text2: "#3f5573",
    }),
  },
  {
    id: "sunset-warm",
    label: "Sunset Warm",
    description: "Warm terracotta with peach and cream tones.",
    swatch: ["#3f1d0f", "#ea580c", "#fdf3ec", "#ffffff"],
    vars: build({
      bg: "#ffffff",
      fg: "#3f1d0f",
      brand: "#ea580c",
      brandHover: "#c2410c",
      brandFg: "#ffffff",
      brandSoft: "#ffedd5",
      navy: "#3f1d0f",
      navy2: "#7c2d12",
      neutral: "#8a6a58",
      bg2: "#fdf3ec",
      border: "#f0dccb",
      text2: "#6b4a37",
    }),
  },
  {
    id: "mono-minimal",
    label: "Mono Minimal",
    description: "Pure black on white — clean editorial look.",
    swatch: ["#000000", "#171717", "#f5f5f5", "#ffffff"],
    vars: build({
      bg: "#ffffff",
      fg: "#0a0a0a",
      brand: "#171717",
      brandHover: "#000000",
      brandFg: "#ffffff",
      brandSoft: "#f5f5f5",
      navy: "#0a0a0a",
      navy2: "#262626",
      neutral: "#737373",
      bg2: "#f5f5f5",
      border: "#e5e5e5",
      text2: "#404040",
    }),
  },
];

export const DEFAULT_THEME_ID: ThemeId = "brand-blue";

export function getTheme(id: string | undefined | null): ThemePreset {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function applyTheme(id: string | undefined | null) {
  if (typeof document === "undefined") return;
  const theme = getTheme(id);
  const root = document.documentElement;
  const v = theme.vars;
  const map: Record<string, string> = {
    "--background": v.background,
    "--foreground": v.foreground,
    "--card": v.card,
    "--card-foreground": v.foreground,
    "--popover": v.card,
    "--popover-foreground": v.foreground,
    "--brand": v.brand,
    "--brand-hover": v.brandHover,
    "--brand-foreground": v.brandForeground,
    "--brand-soft": v.brandSoft,
    "--navy": v.navy,
    "--navy-2": v.navy2,
    "--secondary-label": v.secondaryLabel,
    "--accent-warm": v.accentWarm,
    "--accent-warm-soft": v.accentWarmSoft,
    "--neutral": v.neutral,
    "--bg2": v.bg2,
    "--border": v.border,
    "--text": v.text,
    "--text2": v.text2,
    "--peach": v.peach,
    "--peach-soft": v.peachSoft,
    "--primary": v.primary,
    "--primary-foreground": v.primaryForeground,
    "--secondary": v.secondary,
    "--secondary-foreground": v.secondaryForeground,
    "--muted": v.muted,
    "--muted-foreground": v.mutedForeground,
    "--accent": v.accent,
    "--accent-foreground": v.accentForeground,
    "--destructive": v.destructive,
    "--destructive-foreground": v.destructiveForeground,
    "--input": v.input,
    "--ring": v.ring,
  };

  const readableOverrides: Partial<Record<ThemeId, Partial<Record<string, string>>>> = {
    "paper-ink": {
      "--background": "#f5f3ee",
      "--foreground": "#0d0d0d",
      "--card": "#faf8f3",
      "--card-foreground": "#0d0d0d",
      "--popover": "#faf8f3",
      "--popover-foreground": "#0d0d0d",
      "--text": "#0d0d0d",
      "--text2": "#4a4a45",
      "--neutral": "#5f5c55",
      "--muted-foreground": "#5f5c55",
    },
    "navy-gold": {
      "--background": "#0f1b3d",
      "--foreground": "#f7f1dc",
      "--card": "#172547",
      "--card-foreground": "#f7f1dc",
      "--popover": "#172547",
      "--popover-foreground": "#f7f1dc",
      "--brand": "#c9a84c",
      "--brand-hover": "#d4b45c",
      "--brand-foreground": "#0f1b3d",
      "--brand-soft": "rgba(201,168,76,0.16)",
      "--bg2": "#172547",
      "--border": "rgba(201,168,76,0.35)",
      "--text": "#f7f1dc",
      "--text2": "#d7c690",
      "--neutral": "#d7c690",
      "--secondary": "#172547",
      "--secondary-foreground": "#f7f1dc",
      "--muted": "#172547",
      "--muted-foreground": "#d7c690",
      "--accent": "rgba(201,168,76,0.16)",
      "--accent-foreground": "#f7f1dc",
      "--input": "#172547",
    },
    "midnight-emerald": {
      "--background": "#0a1410",
      "--foreground": "#e6fff5",
      "--card": "#0f1f18",
      "--card-foreground": "#e6fff5",
      "--popover": "#0f1f18",
      "--popover-foreground": "#e6fff5",
      "--brand": "#10b981",
      "--brand-hover": "#34d399",
      "--brand-foreground": "#001a10",
      "--brand-soft": "rgba(16,185,129,0.16)",
      "--bg2": "#0f1f18",
      "--border": "rgba(16,185,129,0.32)",
      "--text": "#e6fff5",
      "--text2": "#94e8ce",
      "--neutral": "#94e8ce",
      "--secondary": "#0f1f18",
      "--secondary-foreground": "#e6fff5",
      "--muted": "#0f1f18",
      "--muted-foreground": "#94e8ce",
      "--accent": "rgba(16,185,129,0.16)",
      "--accent-foreground": "#e6fff5",
      "--input": "#0f1f18",
    },
    "royal-purple": {
      "--background": "#faf7ff",
      "--foreground": "#241044",
      "--card": "rgba(255,255,255,0.82)",
      "--card-foreground": "#241044",
      "--popover": "#ffffff",
      "--popover-foreground": "#241044",
      "--text": "#241044",
      "--text2": "#56416f",
      "--neutral": "#67527e",
      "--muted-foreground": "#67527e",
    },
    "crimson-noir": {
      "--background": "#fef8f0",
      "--foreground": "#1a1a1a",
      "--card": "#ffffff",
      "--card-foreground": "#1a1a1a",
      "--popover": "#ffffff",
      "--popover-foreground": "#1a1a1a",
      "--text": "#1a1a1a",
      "--text2": "#4a3a3a",
      "--neutral": "#5b4646",
      "--muted-foreground": "#5b4646",
    },
    "ocean-breeze": {
      "--background": "#f0f9ff",
      "--foreground": "#082f49",
      "--card": "rgba(255,255,255,0.86)",
      "--card-foreground": "#082f49",
      "--popover": "#ffffff",
      "--popover-foreground": "#082f49",
      "--text": "#082f49",
      "--text2": "#1e5878",
      "--neutral": "#335f7c",
      "--muted-foreground": "#335f7c",
    },
    "sunset-warm": {
      "--background": "#fff7ed",
      "--foreground": "#3f1d0f",
      "--card": "#fffbf5",
      "--card-foreground": "#3f1d0f",
      "--popover": "#fffbf5",
      "--popover-foreground": "#3f1d0f",
      "--text": "#3f1d0f",
      "--text2": "#6b3b22",
      "--neutral": "#744c37",
      "--muted-foreground": "#744c37",
    },
    "mono-minimal": {
      "--background": "#ffffff",
      "--foreground": "#000000",
      "--card": "#ffffff",
      "--card-foreground": "#000000",
      "--popover": "#ffffff",
      "--popover-foreground": "#000000",
      "--text": "#000000",
      "--text2": "#404040",
      "--neutral": "#525252",
      "--muted-foreground": "#525252",
    },
  };

  Object.assign(map, readableOverrides[theme.id]);
  for (const [k, val] of Object.entries(map)) root.style.setProperty(k, val);
  root.setAttribute("data-theme", theme.id);
}
