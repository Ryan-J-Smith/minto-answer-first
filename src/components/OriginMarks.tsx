import React from "react";
import { colors } from "../theme";

const rand = (seed: number): (() => number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
};

export type ProofMark = { x: number; y: number; w: number; kind: "strike" | "circle" | "under" | "caret" };

/** Deterministic proofreading marks scattered over a document area. */
export const makeProofMarks = (count: number, seed: number, area: { x: number; y: number; w: number; h: number; lineH: number }): ProofMark[] => {
  const r = rand(seed);
  const marks: ProofMark[] = [];
  const kinds: ProofMark["kind"][] = ["strike", "circle", "under", "caret", "strike", "under"];
  const lines = Math.floor(area.h / area.lineH);
  for (let i = 0; i < count; i++) {
    const line = Math.floor(r() * lines);
    const w = 40 + r() * 120;
    marks.push({
      x: area.x + r() * (area.w - w),
      y: area.y + line * area.lineH + area.lineH / 2,
      w,
      kind: kinds[Math.floor(r() * kinds.length)] ?? "strike",
    });
  }
  return marks;
};

/** Red-pen marks drawn on one by one; `shown` is how many are visible (fractional = partial draw). */
export const OriginMarks: React.FC<{ marks: ProofMark[]; shown: number; opacity?: number }> = ({ marks, shown, opacity = 1 }) => (
  <svg width={1080} height={1080} style={{ position: "absolute", left: 0, top: 0, opacity }}>
    {marks.map((m, i) => {
      if (i >= Math.ceil(shown)) return null;
      const p = i < Math.floor(shown) ? 1 : shown - Math.floor(shown);
      const common = {
        fill: "none",
        stroke: colors.accent,
        strokeWidth: 3,
        strokeLinecap: "round" as const,
        pathLength: 1,
        strokeDasharray: 1,
        strokeDashoffset: 1 - p,
      };
      if (m.kind === "strike") return <path key={i} d={`M ${m.x} ${m.y} l ${m.w} ${-3}`} {...common} />;
      if (m.kind === "under") return <path key={i} d={`M ${m.x} ${m.y + 10} q ${m.w / 2} 6 ${m.w} 0`} {...common} />;
      if (m.kind === "caret") return <path key={i} d={`M ${m.x} ${m.y + 12} l 8 -14 l 8 14`} {...common} />;
      const rx = m.w / 2;
      return <path key={i} d={`M ${m.x} ${m.y} a ${rx} 11 0 1 0 ${m.w} 0 a ${rx} 11 0 1 0 ${-m.w} 0`} {...common} />;
    })}
  </svg>
);

export type Ray = { x: number; y: number };

/** Deterministic scatter of end-points for the radiating lines. */
export const makeRays = (count: number, seed: number, box: { x: number; y: number; w: number; h: number }): Ray[] => {
  const r = rand(seed);
  const rays: Ray[] = [];
  for (let i = 0; i < count; i++) {
    rays.push({ x: box.x + r() * box.w, y: box.y + r() * box.h });
  }
  return rays;
};

/** Thin lines from one origin to many points, drawing on with a stagger; a dot lands at each end. */
export const OriginRays: React.FC<{ from: Ray; rays: Ray[]; progress: number; opacity?: number }> = ({ from, rays, progress, opacity = 1 }) => (
  <svg width={1080} height={1080} style={{ position: "absolute", left: 0, top: 0, opacity }}>
    {rays.map((p, i) => {
      const stagger = i / rays.length;
      const local = Math.min(1, Math.max(0, (progress - stagger * 0.7) / 0.3));
      if (local <= 0) return null;
      return (
        <g key={i}>
          <line
            x1={from.x}
            y1={from.y}
            x2={p.x}
            y2={p.y}
            stroke={colors.rule}
            strokeWidth={1.5}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - local}
          />
          {local >= 0.98 ? <circle cx={p.x} cy={p.y} r={5} fill={colors.ink} /> : null}
        </g>
      );
    })}
  </svg>
);
