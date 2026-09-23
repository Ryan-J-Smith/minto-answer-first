import React from "react";
import { colors, fonts } from "../theme";

/**
 * Fake document prose: rows of grey "text" bars with occasional headings, so a page can fill up
 * without anything readable competing with the captions. Deterministic per seed so renders are stable.
 */
export type DocLine = { kind: "heading" | "text" | "gap"; width: number; label?: string };

const rand = (seed: number): (() => number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
};

export const makeDocLines = (count: number, seed: number, headings: string[]): DocLine[] => {
  const r = rand(seed);
  const lines: DocLine[] = [];
  let h = 0;
  for (let i = 0; i < count; i++) {
    if (i % 9 === 0 && h < headings.length) {
      if (i > 0) lines.push({ kind: "gap", width: 0 });
      lines.push({ kind: "heading", width: 0.35 + r() * 0.25, label: headings[h++] });
    } else {
      lines.push({ kind: "text", width: 0.55 + r() * 0.42 });
    }
  }
  return lines;
};

export const DocumentLines: React.FC<{
  lines: DocLine[];
  /** How many lines are visible (can be fractional for a partial last line). */
  shown: number;
  width: number;
  lineHeight?: number;
  x: number;
  y: number;
  opacity?: number;
  /** Index of a line to render as real ink text instead of a bar. */
  highlightIndex?: number;
  highlightText?: string;
  highlightStrength?: number;
}> = ({ lines, shown, width, lineHeight = 26, x, y, opacity = 1, highlightIndex, highlightText, highlightStrength = 0 }) => {
  return (
    <div style={{ position: "absolute", left: x, top: y, width, opacity }}>
      {lines.map((l, i) => {
        if (i >= Math.ceil(shown)) return null;
        const partial = i === Math.floor(shown) ? shown - Math.floor(shown) : 1;
        if (l.kind === "gap") return <div key={i} style={{ height: lineHeight * 0.6 }} />;
        if (i === highlightIndex && highlightText) {
          return (
            <div
              key={i}
              style={{
                height: lineHeight,
                display: "flex",
                alignItems: "center",
                fontFamily: fonts.display,
                fontWeight: 600,
                fontSize: lineHeight * 0.78,
                color: colors.ink,
                opacity: 0.35 + 0.65 * highlightStrength,
                whiteSpace: "nowrap",
              }}
            >
              {highlightText}
            </div>
          );
        }
        if (l.kind === "heading") {
          return (
            <div
              key={i}
              style={{
                height: lineHeight,
                display: "flex",
                alignItems: "center",
                fontFamily: fonts.body,
                fontWeight: 600,
                fontSize: lineHeight * 0.55,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: colors.inkSoft,
              }}
            >
              {l.label}
            </div>
          );
        }
        return (
          <div key={i} style={{ height: lineHeight, display: "flex", alignItems: "center" }}>
            <div
              style={{
                height: lineHeight * 0.42,
                width: `${l.width * 100 * partial}%`,
                backgroundColor: colors.inkFaint,
                borderRadius: 3,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};
