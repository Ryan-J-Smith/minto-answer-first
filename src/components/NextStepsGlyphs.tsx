import React from "react";
import { colors, fonts, strokes } from "../theme";

/** Glyphs for the three next steps: an email, an issue tree splitting MECE, and an AI prompt bar. */

/** An email whose first line is the answer, in fg; everything after is faint bars. */
export const EmailGlyph: React.FC<{ x: number; y: number; enter: number; firstLine: number }> = ({
  x,
  y,
  enter,
  firstLine,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: 300,
      height: 176,
      boxSizing: "border-box",
      border: `${strokes.box}px solid ${colors.fg}`,
      borderRadius: 4,
      backgroundColor: colors.surface,
      padding: "16px 20px",
      opacity: enter,
      translate: `0px ${(1 - enter) * 18}px`,
    }}
  >
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <div style={{ fontFamily: fonts.body, fontSize: 16, letterSpacing: "0.1em", color: colors.fgSoft }}>TO</div>
      <div style={{ height: 8, width: 110, backgroundColor: colors.fgFaint, borderRadius: 2 }} />
    </div>
    <div style={{ height: 2, backgroundColor: colors.rule, margin: "12px 0 14px" }} />
    <div
      style={{
        fontFamily: fonts.display,
        fontWeight: 600,
        fontSize: 22,
        lineHeight: 1.15,
        color: colors.fg,
        opacity: 0.25 + 0.75 * firstLine,
        whiteSpace: "nowrap",
      }}
    >
      Raise the price 8%.
    </div>
    {[0.92, 0.7, 0.8].map((w, i) => (
      <div
        key={i}
        style={{ height: 7, width: `${w * 100}%`, backgroundColor: colors.fgFaint, borderRadius: 2, marginTop: 12 }}
      />
    ))}
  </div>
);

/**
 * One box splits into three. `split` 0..1 drives the children descending and separating from
 * beneath the parent; as they separate they tint amber. `label` 0..1 fades "MECE" in beneath.
 */
export const IssueTreeGlyph: React.FC<{ x: number; y: number; enter: number; split: number; label: number }> = ({
  x,
  y,
  enter,
  split,
  label,
}) => {
  const W = 300;
  const parentW = 120;
  const parentH = 40;
  const childW = 84;
  const childH = 36;
  const parentX = (W - parentW) / 2;
  const parentY = 14;
  const childY = parentY + parentH + 10 + split * 34;
  const spread = split * (childW + 14);
  const centres = [-1, 0, 1].map((k) => W / 2 + k * spread);
  const tint = Math.max(0, (split - 0.35) / 0.65);
  const midY = (parentY + parentH + childY) / 2;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: W, height: 176, opacity: enter, translate: `0px ${(1 - enter) * 18}px` }}>
      <svg width={W} height={176} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {centres.map((cx, i) => (
          <path
            key={i}
            d={`M ${W / 2} ${parentY + parentH} V ${midY} H ${cx} V ${childY}`}
            fill="none"
            stroke={colors.rule}
            strokeWidth={strokes.hairline}
            opacity={split}
          />
        ))}
      </svg>
      <div
        style={{
          position: "absolute",
          left: parentX,
          top: parentY,
          width: parentW,
          height: parentH,
          boxSizing: "border-box",
          border: `${strokes.box}px solid ${colors.fg}`,
          borderRadius: 4,
          backgroundColor: colors.surface,
        }}
      />
      {centres.map((cx, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: cx - childW / 2,
            top: childY,
            width: childW,
            height: childH,
            boxSizing: "border-box",
            border: `${strokes.box}px solid ${colors.accent}`,
            borderRadius: 4,
            backgroundColor: colors.surface,
            opacity: 0.35 + 0.65 * split,
            // Amber fill rises as the boxes separate.
            boxShadow: `inset 0 0 0 ${childW}px ${colors.accentSoft}`,
            filter: `opacity(${0.35 + 0.65 * split}) saturate(${0.4 + 0.6 * tint})`,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: 0,
          width: W,
          top: childY + childH + 14,
          textAlign: "center",
          fontFamily: fonts.body,
          fontWeight: 600,
          fontSize: 20,
          letterSpacing: "0.22em",
          color: colors.accent,
          opacity: label,
        }}
      >
        MECE
      </div>
    </div>
  );
};

/**
 * A chat-style input bar with the prompt typed in. `typed` 0..1 is how much of the text has
 * appeared; the caret blinks with `frame`. Deliberately a full sentence on screen, at ≥ 30px, so the
 * viewer can copy it.
 */
export const PromptGlyph: React.FC<{
  x: number;
  y: number;
  width: number;
  enter: number;
  typed: number;
  frame: number;
  text: string;
}> = ({ x, y, width, enter, typed, frame, text }) => {
  const shown = text.slice(0, Math.round(typed * text.length));
  const caretOn = Math.floor(frame / 15) % 2 === 0;
  const done = typed >= 1;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height: 76,
        boxSizing: "border-box",
        border: `${strokes.box}px solid ${colors.fg}`,
        borderRadius: 38,
        backgroundColor: colors.surface,
        padding: "0 30px 0 30px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        opacity: enter,
        translate: `0px ${(1 - enter) * 18}px`,
      }}
    >
      <div
        style={{
          fontFamily: fonts.body,
          fontWeight: 500,
          fontSize: 32,
          lineHeight: 1,
          color: colors.fg,
          whiteSpace: "nowrap",
          overflow: "hidden",
          flex: 1,
        }}
      >
        {shown}
        <span style={{ color: colors.accent, opacity: done ? (caretOn ? 1 : 0) : 1 }}>|</span>
      </div>
      <svg width={30} height={30} style={{ flexShrink: 0, opacity: done ? 1 : 0.45 }}>
        <circle cx={15} cy={15} r={14} fill={colors.accent} />
        <path d="M 15 22 V 8 M 9 14 L 15 8 L 21 14" fill="none" stroke={colors.bg} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};
