/**
 * Design tokens. Dark navy, off-white type, one cyan accent: the sensibility of a strategy-firm
 * keynote (deep blue field, thin light line-work, a serif for the big statements) without posing as
 * any firm. Every scene reads from here so the look can be tuned in one place.
 *
 * Naming: `fg`/`surface` are the current names. `ink`/`paper` remain as aliases from the earlier
 * paper-and-ink palette so older scene code keeps compiling; they map to the same values.
 */
import { Easing } from "remotion";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadJost } from "@remotion/google-fonts/Jost";
import { loadFont as loadCormorant } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadNewsreader } from "@remotion/google-fonts/Newsreader";
import { loadFont as loadSourceSerif } from "@remotion/google-fonts/SourceSerif4";
import { loadFont as loadSpectral } from "@remotion/google-fonts/Spectral";

/**
 * Type pairings. Selected with REMOTION_TYPE (see `typePairings` keys). `display` carries the title,
 * the answers and the big numbers; `body` carries labels, captions and box text; `displayItalic`
 * carries pull-quotes. Loaded lazily so only the chosen pairing is fetched.
 */
type FontSet = { display: string; displayItalic: string; body: string };

const typePairings: Record<string, () => FontSet> = {
  /** Futura-style geometric sans for labels; Cormorant Garamond, a high-contrast old-style serif, for display. */
  "jost-cormorant": () => ({
    display: loadCormorant("normal", { weights: ["600"], subsets: ["latin"] }).fontFamily,
    displayItalic: loadCormorant("italic", { weights: ["500"], subsets: ["latin"] }).fontFamily,
    body: loadJost("normal", { weights: ["400", "500", "600"], subsets: ["latin"] }).fontFamily,
  }),
  /** Jost for labels; Newsreader, a newsprint serif with a calm texture, for display. */
  "jost-newsreader": () => ({
    display: loadNewsreader("normal", { weights: ["500", "600"], subsets: ["latin"] }).fontFamily,
    displayItalic: loadNewsreader("italic", { weights: ["400"], subsets: ["latin"] }).fontFamily,
    body: loadJost("normal", { weights: ["400", "500", "600"], subsets: ["latin"] }).fontFamily,
  }),
  /** Jost for labels; Source Serif 4, a sturdy transitional serif, for display. */
  "jost-sourceserif": () => ({
    display: loadSourceSerif("normal", { weights: ["600"], subsets: ["latin"] }).fontFamily,
    displayItalic: loadSourceSerif("italic", { weights: ["400"], subsets: ["latin"] }).fontFamily,
    body: loadJost("normal", { weights: ["400", "500", "600"], subsets: ["latin"] }).fontFamily,
  }),
  /** Sans-led: Jost carries the display too; Spectral italic only for the pull-quotes. */
  "jost-lead": () => ({
    display: loadJost("normal", { weights: ["500", "600"], subsets: ["latin"] }).fontFamily,
    displayItalic: loadSpectral("italic", { weights: ["400"], subsets: ["latin"] }).fontFamily,
    body: loadJost("normal", { weights: ["400", "500", "600"], subsets: ["latin"] }).fontFamily,
  }),
  /** The previous pairing, for comparison. */
  "inter-fraunces": () => ({
    display: loadFraunces("normal", { weights: ["400", "600"], subsets: ["latin"] }).fontFamily,
    displayItalic: loadFraunces("italic", { weights: ["400"], subsets: ["latin"] }).fontFamily,
    body: loadInter("normal", { weights: ["400", "500", "600"], subsets: ["latin"] }).fontFamily,
  }),
};

const typeKey = (typeof process !== "undefined" && process.env.REMOTION_TYPE) || "jost-newsreader";
const chosenFonts = (typePairings[typeKey] ?? typePairings["jost-newsreader"]!)();

export const fonts = {
  display: chosenFonts.display,
  displayItalic: chosenFonts.displayItalic,
  body: chosenFonts.body,
} as const;

/**
 * Palettes. Selected at render/preview time with the env var REMOTION_THEME (see `palettes` keys),
 * so stylistic options can be compared as stills without touching scene code.
 * Every palette must be clearly its own thing: no firm's house colours, no firm's motifs.
 */
export type Palette = {
  name: string;
  mode: "dark" | "light";
  bg: string;
  bgGlow: string;
  surface: string;
  surfaceDeep: string;
  fg: string;
  fgSoft: string;
  fgFaint: string;
  fgDim: string;
  rule: string;
  accent: string;
  accentSoft: string;
  /** Decorative line-work on the bookends. Off by default; it read as a firm's motif. */
  decor: "none";
};

const dark = (name: string, p: { bg: string; glow: string; surface: string; surfaceDeep: string; fg: string; fgSoft: string; fgRgb: string; accent: string; accentRgb: string }): Palette => ({
  name,
  mode: "dark",
  bg: p.bg,
  bgGlow: p.glow,
  surface: p.surface,
  surfaceDeep: p.surfaceDeep,
  fg: p.fg,
  fgSoft: p.fgSoft,
  fgFaint: `rgba(${p.fgRgb}, 0.18)`,
  fgDim: `rgba(${p.fgRgb}, 0.55)`,
  rule: `rgba(${p.fgRgb}, 0.42)`,
  accent: p.accent,
  accentSoft: `rgba(${p.accentRgb}, 0.22)`,
  decor: "none",
});

export const palettes: Record<string, Palette> = {
  /** Warm charcoal with a brass accent. Premium documentary, not a consultancy. */
  charcoal: dark("Charcoal & brass", {
    bg: "#151516", glow: "#2B2A2C", surface: "#1F1F22", surfaceDeep: "#1A1A1D",
    fg: "#F4F1EA", fgSoft: "#B9B4A9", fgRgb: "244, 241, 234", accent: "#D9A441", accentRgb: "217, 164, 65",
  }),
  /** Cool slate with a coral accent. Modern explainer; nothing like a strategy deck. */
  slate: dark("Slate & coral", {
    bg: "#171B21", glow: "#2A313B", surface: "#20262E", surfaceDeep: "#1B2027",
    fg: "#F1F3F5", fgSoft: "#AEB6C1", fgRgb: "241, 243, 245", accent: "#FF6B57", accentRgb: "255, 107, 87",
  }),
  /** Slate with a blue-leaning cyan. */
  "slate-cyan": dark("Slate & cyan", {
    bg: "#171B21", glow: "#2A313B", surface: "#20262E", surfaceDeep: "#1B2027",
    fg: "#F1F3F5", fgSoft: "#AEB6C1", fgRgb: "241, 243, 245", accent: "#38C3F5", accentRgb: "56, 195, 245",
  }),
  "slate-teal": dark("Slate & teal", {
    bg: "#171B21", glow: "#2A313B", surface: "#20262E", surfaceDeep: "#1B2027",
    fg: "#F1F3F5", fgSoft: "#AEB6C1", fgRgb: "241, 243, 245", accent: "#35D1C8", accentRgb: "53, 209, 200",
  }),
  "slate-amber": dark("Slate & amber", {
    bg: "#171B21", glow: "#2A313B", surface: "#20262E", surfaceDeep: "#1B2027",
    fg: "#F1F3F5", fgSoft: "#AEB6C1", fgRgb: "241, 243, 245", accent: "#F0B640", accentRgb: "240, 182, 64",
  }),
  "slate-coral": dark("Slate & coral", {
    bg: "#171B21", glow: "#2A313B", surface: "#20262E", surfaceDeep: "#1B2027",
    fg: "#F1F3F5", fgSoft: "#AEB6C1", fgRgb: "241, 243, 245", accent: "#FF6B57", accentRgb: "255, 107, 87",
  }),
  "slate-lavender": dark("Slate & lavender", {
    bg: "#171B21", glow: "#2A313B", surface: "#20262E", surfaceDeep: "#1B2027",
    fg: "#F1F3F5", fgSoft: "#AEB6C1", fgRgb: "241, 243, 245", accent: "#A99BFF", accentRgb: "169, 155, 255",
  }),
  "slate-mint": dark("Slate & mint", {
    bg: "#171B21", glow: "#2A313B", surface: "#20262E", surfaceDeep: "#1B2027",
    fg: "#F1F3F5", fgSoft: "#AEB6C1", fgRgb: "241, 243, 245", accent: "#6BE3A6", accentRgb: "107, 227, 166",
  }),
  "slate-rose": dark("Slate & rose", {
    bg: "#171B21", glow: "#2A313B", surface: "#20262E", surfaceDeep: "#1B2027",
    fg: "#F1F3F5", fgSoft: "#AEB6C1", fgRgb: "241, 243, 245", accent: "#FF7BAC", accentRgb: "255, 123, 172",
  }),
  "slate-royal": dark("Slate & royal blue", {
    bg: "#171B21", glow: "#2A313B", surface: "#20262E", surfaceDeep: "#1B2027",
    fg: "#F1F3F5", fgSoft: "#AEB6C1", fgRgb: "241, 243, 245", accent: "#3E7BFF", accentRgb: "62, 123, 255",
  }),
  "slate-azure": dark("Slate & azure", {
    bg: "#171B21", glow: "#2A313B", surface: "#20262E", surfaceDeep: "#1B2027",
    fg: "#F1F3F5", fgSoft: "#AEB6C1", fgRgb: "241, 243, 245", accent: "#4FA3FF", accentRgb: "79, 163, 255",
  }),
  "slate-sky": dark("Slate & sky", {
    bg: "#171B21", glow: "#2A313B", surface: "#20262E", surfaceDeep: "#1B2027",
    fg: "#F1F3F5", fgSoft: "#AEB6C1", fgRgb: "241, 243, 245", accent: "#7CC4FF", accentRgb: "124, 196, 255",
  }),
  "slate-periwinkle": dark("Slate & periwinkle", {
    bg: "#171B21", glow: "#2A313B", surface: "#20262E", surfaceDeep: "#1B2027",
    fg: "#F1F3F5", fgSoft: "#AEB6C1", fgRgb: "241, 243, 245", accent: "#7D8CFF", accentRgb: "125, 140, 255",
  }),
  /** Deep plum with an apricot accent. Distinctive and warm; reads editorial. */
  plum: dark("Plum & apricot", {
    bg: "#1E1420", glow: "#3A2540", surface: "#2A1D2E", surfaceDeep: "#241826",
    fg: "#F6EFEA", fgSoft: "#C3B2BC", fgRgb: "246, 239, 234", accent: "#F2A65A", accentRgb: "242, 166, 90",
  }),
  /** The original paper and ink, light. Warm off-white, ink navy, terracotta. */
  paper: {
    name: "Paper & ink",
    mode: "light",
    bg: "#F3EEE4",
    bgGlow: "#FFFFFF",
    surface: "#F3EEE4",
    surfaceDeep: "#E7E0D2",
    fg: "#1C2333",
    fgSoft: "#5B6272",
    fgFaint: "rgba(28, 35, 51, 0.16)",
    fgDim: "rgba(28, 35, 51, 0.55)",
    rule: "rgba(28, 35, 51, 0.38)",
    accent: "#B8452B",
    accentSoft: "rgba(184, 69, 43, 0.22)",
    decor: "none",
  },
};

const themeKey = (typeof process !== "undefined" && process.env.REMOTION_THEME) || "slate-amber";
export const palette: Palette = palettes[themeKey] ?? palettes["slate-amber"]!;

export const colors = {
  bg: palette.bg,
  bgGlow: palette.bgGlow,
  surface: palette.surface,
  surfaceDeep: palette.surfaceDeep,
  fg: palette.fg,
  fgSoft: palette.fgSoft,
  fgFaint: palette.fgFaint,
  fgDim: palette.fgDim,
  rule: palette.rule,
  accent: palette.accent,
  accentSoft: palette.accentSoft,
  // ---- aliases kept from the paper palette; same values as above ----
  paper: palette.surface,
  paperDeep: palette.surfaceDeep,
  ink: palette.fg,
  inkSoft: palette.fgSoft,
  inkFaint: palette.fgFaint,
  inkDim: palette.fgDim,
} as const;

/** Composition is 1080×1080. Keep key content inside this margin. */
export const layout = {
  margin: 88,
  /** Shared vertical footprint for scene content, so no scene reads top-loaded. */
  contentTop: 170,
  contentBottom: 800,
  captionBottom: 84,
  captionSafeTop: 880,
} as const;

export const type = {
  eyebrow: { fontFamily: fonts.body, fontSize: 22, letterSpacing: "0.18em", fontWeight: 500 },
  display: { fontFamily: fonts.display, fontSize: 96, fontWeight: 600, lineHeight: 1.02 },
  headline: { fontFamily: fonts.display, fontSize: 56, fontWeight: 600, lineHeight: 1.12 },
  lede: { fontFamily: fonts.display, fontSize: 40, fontWeight: 400, lineHeight: 1.3 },
  box: { fontFamily: fonts.body, fontSize: 30, fontWeight: 600, lineHeight: 1.2 },
  boxSub: { fontFamily: fonts.body, fontSize: 24, fontWeight: 400, lineHeight: 1.3 },
  caption: { fontFamily: fonts.body, fontSize: 36, fontWeight: 500, lineHeight: 1.3 },
  small: { fontFamily: fonts.body, fontSize: 20, fontWeight: 400, lineHeight: 1.4 },
} as const;

/** Stroke weights. Light lines on a dark field need a touch more weight than ink on paper. */
export const strokes = {
  hairline: 1.5,
  box: 2.5,
  emphasis: 3.5,
} as const;

/** The one easing used for entrances. Ease-out expo: quick start, long settle, no bounce. */
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
