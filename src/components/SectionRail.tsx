import React from "react";
import { colors, fonts, layout } from "../theme";

/** The film's sections, in order. Index into this from each scene. */
export const SECTIONS = ["Answer", "Origin", "Technique", "Reach", "Next steps"] as const;

/**
 * A metro-line section tracker across the top of the frame: a thin rail with one stop per section,
 * the current stop filled with the accent and named beneath it. Replaces the "SLIDE n OF 5" eyebrow.
 * `enter` 0..1 draws the rail on; the current stop's ring grows with it.
 */
export const SectionRail: React.FC<{
  current: number;
  enter?: number;
  /** Fraction 0..1 of progress within the current section, drawn as a fill toward the next stop. */
  progress?: number;
  y?: number;
}> = ({ current, enter = 1, progress = 0, y = 112 }) => {
  const left = layout.margin;
  const right = 1080 - layout.margin;
  const n = SECTIONS.length;
  const step = (right - left) / (n - 1);
  const stopX = (i: number): number => left + step * i;
  const drawnTo = left + (right - left) * enter;
  const filledTo = Math.min(drawnTo, stopX(current) + step * Math.max(0, Math.min(1, progress)));
  return (
    <div style={{ position: "absolute", left: 0, top: y, width: 1080, height: 70, opacity: enter > 0 ? 1 : 0 }}>
      <svg width={1080} height={70} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <line x1={left} y1={12} x2={drawnTo} y2={12} stroke={colors.rule} strokeWidth={2} />
        <line x1={left} y1={12} x2={filledTo} y2={12} stroke={colors.accent} strokeWidth={2} />
        {SECTIONS.map((_, i) => {
          const x = stopX(i);
          if (x > drawnTo + 0.5) return null;
          const isCurrent = i === current;
          const done = i < current;
          const r = isCurrent ? 8 : 5;
          return (
            <circle
              key={i}
              cx={x}
              cy={12}
              r={r}
              fill={isCurrent || done ? colors.accent : colors.bg}
              stroke={isCurrent || done ? colors.accent : colors.rule}
              strokeWidth={2}
            />
          );
        })}
      </svg>
      {SECTIONS.map((name, i) => {
        const isCurrent = i === current;
        const x = stopX(i);
        const w = 260;
        // End labels hang inward from their stop so nothing leaves the safe area or wraps.
        const boxLeft = i === 0 ? x - 6 : i === n - 1 ? x - w + 6 : x - w / 2;
        const align: "left" | "center" | "right" = i === 0 ? "left" : i === n - 1 ? "right" : "center";
        return (
          <div
            key={name}
            style={{
              position: "absolute",
              top: 30,
              left: boxLeft,
              width: w,
              textAlign: align,
              whiteSpace: "nowrap",
              fontFamily: fonts.body,
              fontSize: 20,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: isCurrent ? colors.fg : colors.fgSoft,
              opacity: isCurrent ? 1 : 0.55,
            }}
          >
            {name}
          </div>
        );
      })}
    </div>
  );
};
