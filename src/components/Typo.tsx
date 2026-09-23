import React from "react";
import { colors, fonts, type } from "../theme";

/** Small tracked label, e.g. "SLIDE 2 OF 5 · TECHNIQUE". */
export const Eyebrow: React.FC<{ children: React.ReactNode; enter?: number; style?: React.CSSProperties }> = ({
  children,
  enter = 1,
  style,
}) => (
  <div
    style={{
      ...type.eyebrow,
      color: colors.inkSoft,
      opacity: enter,
      translate: `0px ${(1 - enter) * 8}px`,
      textTransform: "uppercase",
      ...style,
    }}
  >
    {children}
  </div>
);

/** A large serif number or word with an optional label and source line beneath. */
export const BigStat: React.FC<{
  value: string;
  label?: string;
  source?: string;
  enter?: number;
  size?: number;
  align?: "left" | "center";
  style?: React.CSSProperties;
}> = ({ value, label, source, enter = 1, size = 160, align = "left", style }) => (
  <div
    style={{
      position: "absolute",
      opacity: enter,
      translate: `0px ${(1 - enter) * 18}px`,
      textAlign: align,
      ...style,
    }}
  >
    <div style={{ fontFamily: fonts.display, fontWeight: 600, fontSize: size, lineHeight: 0.95, color: colors.ink }}>
      {value}
    </div>
    {label ? (
      <div style={{ ...type.lede, fontSize: Math.round(size * 0.22), color: colors.ink, marginTop: Math.round(size * 0.08) }}>
        {label}
      </div>
    ) : null}
    {source ? (
      <div style={{ ...type.small, color: colors.inkSoft, marginTop: Math.round(size * 0.05) }}>{source}</div>
    ) : null}
  </div>
);

/** A pull quote in serif italic with attribution. */
export const Quote: React.FC<{
  text: string;
  attribution?: string;
  enter?: number;
  size?: number;
  style?: React.CSSProperties;
}> = ({ text, attribution, enter = 1, size = 52, style }) => (
  <div style={{ position: "absolute", opacity: enter, translate: `0px ${(1 - enter) * 14}px`, ...style }}>
    <div style={{ fontFamily: fonts.displayItalic, fontStyle: "italic", fontSize: size, lineHeight: 1.2, color: colors.ink }}>
      “{text}”
    </div>
    {attribution ? (
      <div style={{ ...type.eyebrow, color: colors.inkSoft, marginTop: Math.round(size * 0.5) }}>— {attribution}</div>
    ) : null}
  </div>
);
