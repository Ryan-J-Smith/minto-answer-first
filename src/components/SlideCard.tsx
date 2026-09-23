import React from "react";
import { colors, fonts } from "../theme";

/**
 * A 16:9 slide card, drawn the way a plain consulting slide is laid out: action title on top,
 * a thin rule, then content. No logos. Used for the deck scenes and the reveal.
 */
export const SlideCard: React.FC<{
  width: number;
  title: string;
  bullets?: string[];
  number?: string;
  /** 0..1 entrance */
  enter?: number;
  /** Highlight 0..1 */
  emphasis?: number;
  style?: React.CSSProperties;
}> = ({ width, title, bullets = [], number, enter = 1, emphasis = 0, style }) => {
  const height = Math.round((width * 9) / 16);
  const pad = Math.round(width * 0.06);
  const titleSize = Math.round(width * 0.062);
  const bulletSize = Math.round(width * 0.042);
  return (
    <div
      style={{
        position: "absolute",
        width,
        height,
        boxSizing: "border-box",
        backgroundColor: colors.paper,
        border: `${2 + emphasis}px solid ${emphasis > 0 ? colors.accent : colors.ink}`,
        borderRadius: Math.max(3, Math.round(width * 0.012)),
        padding: pad,
        opacity: enter,
        boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          fontFamily: fonts.display,
          fontWeight: 600,
          fontSize: titleSize,
          lineHeight: 1.15,
          color: colors.ink,
        }}
      >
        {title}
      </div>
      <div style={{ height: 2, backgroundColor: colors.rule, margin: `${Math.round(pad * 0.5)}px 0` }} />
      <div style={{ display: "flex", flexDirection: "column", gap: Math.round(bulletSize * 0.35) }}>
        {bullets.map((b, i) => (
          <div
            key={i}
            style={{
              fontFamily: fonts.body,
              fontSize: bulletSize,
              lineHeight: 1.25,
              color: colors.inkSoft,
              display: "flex",
              gap: Math.round(bulletSize * 0.5),
            }}
          >
            <span style={{ color: colors.ink }}>{i + 1}.</span>
            <span>{b}</span>
          </div>
        ))}
      </div>
      {number ? (
        <div
          style={{
            position: "absolute",
            right: pad,
            bottom: Math.round(pad * 0.6),
            fontFamily: fonts.body,
            fontSize: Math.round(width * 0.03),
            color: colors.inkSoft,
          }}
        >
          {number}
        </div>
      ) : null}
    </div>
  );
};
