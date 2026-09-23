import React from "react";
import { colors, fonts } from "../theme";

export type RailStop = {
  x: number;
  label?: string;
  year?: string;
  /** 0..1 entrance of this stop (dot + label). */
  enter: number;
};

/**
 * The origin chapter's through-line: a horizontal rail along the bottom of the frame with
 * place-name stops and year ticks that draw on as the story moves.
 */
export const OriginRail: React.FC<{
  y: number;
  x0: number;
  /** How far (px, absolute x) the rail line has drawn to. */
  drawnToX: number;
  stops: RailStop[];
}> = ({ y, x0, drawnToX, stops }) => {
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1080, pointerEvents: "none" }}>
      <svg width={1080} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={x0} y1={y} x2={Math.max(x0, drawnToX)} y2={y} stroke={colors.rule} strokeWidth={2} />
        {stops.map((s, i) => {
          if (s.enter <= 0) return null;
          const r = 7 * s.enter;
          return (
            <g key={i} opacity={s.enter}>
              <circle cx={s.x} cy={y} r={r} fill={colors.paper} stroke={colors.ink} strokeWidth={2} />
              {s.year ? <line x1={s.x} y1={y - 16} x2={s.x} y2={y - 8} stroke={colors.ink} strokeWidth={2} /> : null}
            </g>
          );
        })}
      </svg>
      {stops.map((s, i) => {
        if (s.enter <= 0) return null;
        return (
          <React.Fragment key={`l${i}`}>
            {s.label ? (
              <div
                style={{
                  position: "absolute",
                  left: s.x - 90,
                  top: y + 16,
                  width: 180,
                  textAlign: "center",
                  fontFamily: fonts.body,
                  fontSize: 20,
                  fontWeight: 500,
                  letterSpacing: "0.16em",
                  color: colors.inkSoft,
                  opacity: s.enter,
                  translate: `0px ${(1 - s.enter) * 6}px`,
                }}
              >
                {s.label}
              </div>
            ) : null}
            {s.year ? (
              <div
                style={{
                  position: "absolute",
                  left: s.x - 60,
                  top: y - 48,
                  width: 120,
                  textAlign: "center",
                  fontFamily: fonts.display,
                  fontSize: 26,
                  fontWeight: 600,
                  color: colors.ink,
                  opacity: s.enter,
                  translate: `0px ${(1 - s.enter) * -6}px`,
                }}
              >
                {s.year}
              </div>
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
};
