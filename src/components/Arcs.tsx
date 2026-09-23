import React from "react";
import { colors, palette } from "../theme";

/**
 * Thin sweeping line-work: a fan of bezier curves, light on navy, the decorative signature of the
 * title and credits. `draw` 0..1 draws the curves on; `drift` shifts them slowly for life.
 */
export const Arcs: React.FC<{
  width: number;
  height: number;
  /** Number of curves. */
  count?: number;
  /** 0..1 draw-on progress. */
  draw: number;
  /** Slow parallax offset in px. */
  drift?: number;
  /** Anchor corner the fan converges toward. */
  corner?: "bottom-right" | "top-right" | "bottom-left";
  opacity?: number;
  style?: React.CSSProperties;
}> = ({ width, height, count = 28, draw, drift = 0, corner = "bottom-right", opacity = 0.55, style }) => {
  if (palette.decor === "none") return null;
  const flipX = corner === "bottom-left" ? -1 : 1;
  const flipY = corner === "top-right" ? -1 : 1;
  const paths = Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    // Curves start spread along the top edge and converge toward the anchor corner.
    const x0 = width * (0.35 + 0.6 * t);
    const y0 = -40;
    const cx1 = width * (0.55 + 0.35 * t);
    const cy1 = height * (0.35 + 0.15 * t);
    const cx2 = width * (0.8 + 0.15 * t);
    const cy2 = height * (0.75 + 0.1 * t);
    const x1 = width * 1.05;
    const y1 = height * (0.55 + 0.5 * t);
    return `M ${x0} ${y0} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x1} ${y1}`;
  });
  return (
    <svg
      width={width}
      height={height}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        overflow: "visible",
        opacity,
        transform: `scale(${flipX}, ${flipY}) translate(${drift}px, ${drift * 0.4}px)`,
        transformOrigin: "50% 50%",
        ...style,
      }}
    >
      {paths.map((d, i) => {
        const t = i / (count - 1);
        return (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={t > 0.72 ? colors.accent : colors.fg}
            strokeWidth={1}
            strokeOpacity={0.25 + 0.55 * t}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - Math.min(1, Math.max(0, draw * 1.4 - t * 0.4))}
          />
        );
      })}
    </svg>
  );
};
