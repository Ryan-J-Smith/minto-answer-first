import React from "react";
import { colors, fonts } from "../theme";

/** A tiny three-box pyramid mark (answer + three supports) used as an icon. */
export const PyramidMark: React.FC<{ x: number; y: number; size: number; color?: string; topColor?: string; opacity?: number; stroke?: number }> = ({
  x,
  y,
  size,
  color = colors.ink,
  topColor,
  opacity = 1,
  stroke = 2,
}) => {
  const bw = size * 0.44;
  const bh = size * 0.26;
  const sw = size * 0.28;
  const gap = (size - sw * 3) / 2;
  const topX = (size - bw) / 2;
  const rowY = size - bh;
  return (
    <svg style={{ position: "absolute", left: x, top: y, opacity }} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x={topX} y={0} width={bw} height={bh} fill="none" stroke={topColor ?? color} strokeWidth={stroke} rx={1.5} />
      <line x1={size / 2} y1={bh} x2={size / 2} y2={(bh + rowY) / 2} stroke={color} strokeWidth={stroke * 0.6} />
      <line x1={sw / 2} y1={(bh + rowY) / 2} x2={size - sw / 2} y2={(bh + rowY) / 2} stroke={color} strokeWidth={stroke * 0.6} />
      {[0, 1, 2].map((i) => {
        const bx = i * (sw + gap);
        return (
          <g key={i}>
            <line x1={bx + sw / 2} y1={(bh + rowY) / 2} x2={bx + sw / 2} y2={rowY} stroke={color} strokeWidth={stroke * 0.6} />
            <rect x={bx} y={rowY} width={sw} height={bh} fill="none" stroke={color} strokeWidth={stroke} rx={1.5} />
          </g>
        );
      })}
    </svg>
  );
};

/** A typographic book: cover rectangle with a spine, title and author, no image. */
export const ReachBook: React.FC<{ x: number; y: number; w: number; enter: number }> = ({ x, y, w, enter }) => {
  const h = Math.round(w * 1.42);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        opacity: enter,
        translate: `0px ${(1 - enter) * 16}px`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          border: `2px solid ${colors.ink}`,
          borderLeft: `14px solid ${colors.ink}`,
          borderRadius: "2px 6px 6px 2px",
          backgroundColor: colors.paper,
          boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
          boxSizing: "border-box",
          padding: Math.round(w * 0.1),
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontFamily: fonts.body, fontSize: Math.round(w * 0.055), letterSpacing: "0.16em", color: colors.inkSoft }}>
            THE
          </div>
          <div style={{ fontFamily: fonts.display, fontWeight: 600, fontSize: Math.round(w * 0.135), lineHeight: 1.02, color: colors.ink, marginTop: 6 }}>
            Pyramid
            <br />
            Principle
          </div>
        </div>
        <div>
          <div style={{ height: 2, backgroundColor: colors.rule, marginBottom: Math.round(w * 0.06) }} />
          <div style={{ fontFamily: fonts.body, fontSize: Math.round(w * 0.06), letterSpacing: "0.1em", color: colors.ink }}>
            BARBARA MINTO
          </div>
        </div>
      </div>
    </div>
  );
};

/** Small card with a language name, used for the nine-language fan. */
export const LanguageCard: React.FC<{ x: number; y: number; rotate: number; label: string; enter: number }> = ({ x, y, rotate, label, enter }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: 176,
      height: 56,
      boxSizing: "border-box",
      border: `2px solid ${colors.ink}`,
      borderRadius: 4,
      backgroundColor: colors.paper,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: fonts.body,
      fontSize: 19,
      fontWeight: 500,
      color: colors.ink,
      whiteSpace: "nowrap",
      opacity: enter,
      rotate: `${rotate * enter}deg`,
      translate: `0px ${(1 - enter) * 20}px`,
      boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
    }}
  >
    {label}
  </div>
);

/** Deterministic scatter helper shared by the diffusion animation. */
export const seeded = (seed: number): (() => number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
};

/**
 * A hand-drawn three-box pyramid on a table. `wobble` 0..1 draws the shaky first attempt,
 * `clean` 0..1 draws the confident second pass over it, and `wobbleFade` dims the first.
 */
export const HandPyramid: React.FC<{ x: number; y: number; size: number; wobble: number; clean: number; wobbleFade: number }> = ({
  x,
  y,
  size,
  wobble,
  clean,
  wobbleFade,
}) => {
  const r = seeded(99);
  const jitter = (v: number, amt: number): number => v + (r() - 0.5) * amt;
  const bw = size * 0.44;
  const bh = size * 0.24;
  const sw = size * 0.28;
  const gap = (size - sw * 3) / 2;
  const topX = (size - bw) / 2;
  const rowY = size - bh;
  const rect = (rx: number, ry: number, w: number, h: number, j: number): string => {
    const pts = [
      [rx, ry],
      [rx + w, ry],
      [rx + w, ry + h],
      [rx, ry + h],
    ].map(([px, py]) => [jitter(px ?? 0, j), jitter(py ?? 0, j)]);
    return `M ${pts.map((p) => p.join(" ")).join(" L ")} Z`;
  };
  const build = (j: number): string => {
    const midY = (bh + rowY) / 2;
    let d = rect(topX, 0, bw, bh, j);
    d += ` M ${jitter(size / 2, j)} ${bh} L ${jitter(size / 2, j)} ${midY}`;
    d += ` M ${jitter(sw / 2, j)} ${jitter(midY, j)} L ${jitter(size - sw / 2, j)} ${jitter(midY, j)}`;
    for (let i = 0; i < 3; i++) {
      const bx = i * (sw + gap);
      d += ` M ${jitter(bx + sw / 2, j)} ${midY} L ${jitter(bx + sw / 2, j)} ${rowY}`;
      d += " " + rect(bx, rowY, sw, bh, j);
    }
    return d;
  };
  const wobbly = build(size * 0.07);
  const neat = build(size * 0.012);
  const common = { fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, pathLength: 1, strokeDasharray: 1 };
  return (
    <svg style={{ position: "absolute", left: x, top: y, overflow: "visible" }} width={size} height={size}>
      <path d={wobbly} stroke={colors.inkSoft} strokeWidth={3} {...common} strokeDashoffset={1 - wobble} opacity={1 - wobbleFade * 0.75} />
      <path d={neat} stroke={colors.accent} strokeWidth={3.5} {...common} strokeDashoffset={1 - clean} />
    </svg>
  );
};
