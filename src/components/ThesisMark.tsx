import React from "react";
import { colors } from "../theme";

/**
 * The film's emblem: one box over three, hairline ink. Used above the title, inside slide one,
 * and wherever a "pyramid" glyph is needed at small size.
 */
export const PyramidMark: React.FC<{
  width: number;
  color?: string;
  stroke?: number;
  /** 0..1 draw-on progress. */
  enter?: number;
  /** Fill the top ("answer") box with this colour once drawn, e.g. the accent. */
  topFill?: string;
  style?: React.CSSProperties;
}> = ({ width, color = colors.ink, stroke = 2, enter = 1, topFill, style }) => {
  const h = width * 0.62;
  const top = { x: width * 0.3, y: 0, w: width * 0.4, h: h * 0.3 };
  const gap = width * 0.06;
  const bw = (width - gap * 2) / 3;
  const by = h * 0.62;
  const bh = h * 0.38;
  const midY = (top.y + top.h + by) / 2;
  const boxes = [0, 1, 2].map((i) => ({ x: i * (bw + gap), y: by, w: bw, h: bh }));
  const dash = (p: number): React.CSSProperties => ({ strokeDasharray: 1, strokeDashoffset: 1 - p, opacity: p > 0 ? 1 : 0 });
  const stage = (from: number, to: number): number => Math.max(0, Math.min(1, (enter - from) / (to - from)));
  return (
    <svg width={width} height={h} viewBox={`0 0 ${width} ${h}`} style={{ overflow: "visible", display: "block", ...style }}>
      <rect x={top.x} y={top.y} width={top.w} height={top.h} fill="none" stroke={color} strokeWidth={stroke} pathLength={1} style={dash(stage(0, 0.4))} />
      {topFill ? (
        <rect x={top.x} y={top.y} width={top.w} height={top.h} fill={topFill} stroke={topFill} strokeWidth={stroke} opacity={stage(0.6, 1)} />
      ) : null}
      {boxes.map((b, i) => (
        <React.Fragment key={i}>
          <path
            d={`M ${width / 2} ${top.y + top.h} V ${midY} H ${b.x + b.w / 2} V ${b.y}`}
            fill="none"
            stroke={color}
            strokeWidth={stroke * 0.75}
            pathLength={1}
            style={dash(stage(0.35, 0.7))}
          />
          <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="none" stroke={color} strokeWidth={stroke} pathLength={1} style={dash(stage(0.55 + i * 0.1, 0.85 + i * 0.05))} />
        </React.Fragment>
      ))}
    </svg>
  );
};
