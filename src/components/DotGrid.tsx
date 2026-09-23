import React from "react";
import { colors } from "../theme";

/**
 * A grid of small dots, used for "8 of 600" and the diffusion counts.
 * `reveal` 0..1 fills the grid in reading order; `highlight` marks indices in accent.
 */
export const DotGrid: React.FC<{
  count: number;
  columns: number;
  cell: number;
  dot: number;
  reveal: number;
  highlight?: Set<number>;
  /** 0..1 how strongly highlighted dots pop. */
  highlightStrength?: number;
  style?: React.CSSProperties;
}> = ({ count, columns, cell, dot, reveal, highlight, highlightStrength = 1, style }) => {
  const rows = Math.ceil(count / columns);
  const shown = Math.round(reveal * count);
  return (
    <div style={{ position: "absolute", width: columns * cell, height: rows * cell, ...style }}>
      {Array.from({ length: count }, (_, i) => {
        if (i >= shown) return null;
        const r = Math.floor(i / columns);
        const c = i % columns;
        const hi = highlight?.has(i) ?? false;
        const size = hi ? dot + 4 * highlightStrength : dot;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: c * cell + (cell - size) / 2,
              top: r * cell + (cell - size) / 2,
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: hi ? colors.accent : colors.inkFaint,
              opacity: hi ? 0.3 + 0.7 * highlightStrength : 1,
            }}
          />
        );
      })}
    </div>
  );
};
