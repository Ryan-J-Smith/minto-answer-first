import React from "react";
import { colors } from "../theme";

import { palette } from "../theme";
/** Unhighlighted dots: light on dark, ink on light, always ~30% so the eight accent dots pop. */
const FIELD = palette.mode === "light" ? "rgba(28, 35, 51, 0.30)" : "rgba(242, 245, 250, 0.30)";

/**
 * The "8 of 600" grid. Same contract as the shared DotGrid, with a field colour tuned for the
 * navy background so the 592 ordinary dots still read while the eight in accent pop.
 */
export const OriginDotGrid: React.FC<{
  count: number;
  columns: number;
  cell: number;
  dot: number;
  reveal: number;
  highlight: Set<number>;
  highlightStrength: number;
  style?: React.CSSProperties;
}> = ({ count, columns, cell, dot, reveal, highlight, highlightStrength, style }) => {
  const rows = Math.ceil(count / columns);
  const shown = Math.round(reveal * count);
  return (
    <div style={{ position: "absolute", width: columns * cell, height: rows * cell, ...style }}>
      {Array.from({ length: count }, (_, i) => {
        if (i >= shown) return null;
        const r = Math.floor(i / columns);
        const c = i % columns;
        const hi = highlight.has(i);
        const size = hi ? dot + 5 * highlightStrength : dot;
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
              backgroundColor: hi && highlightStrength > 0 ? colors.accent : FIELD,
              opacity: hi ? 0.4 + 0.6 * highlightStrength : 0.42,
              boxShadow: hi ? `0 0 ${12 * highlightStrength}px ${colors.accentSoft}` : undefined,
            }}
          />
        );
      })}
    </div>
  );
};
