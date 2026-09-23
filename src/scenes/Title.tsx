import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { Arcs } from "../components/Arcs";
import { PyramidMark } from "../components/ThesisMark";
import { enter, sec } from "../components/motion";
import { colors, fonts } from "../theme";

const ID = "02-title";

/** Title treatment. Pick with REMOTION_TITLE_VARIANT for stills; the default is the chosen one. */
const VARIANT = (typeof process !== "undefined" && process.env.REMOTION_TITLE_VARIANT) || "frame";

/** A hairline rule that draws on from its centre, optionally with a small amber diamond at the midpoint. */
const Rule: React.FC<{ y: number; width: number; enter: number; dinkus?: boolean }> = ({ y, width, enter: p, dinkus }) => {
  const half = (width / 2) * p;
  return (
    <svg width={1080} height={24} style={{ position: "absolute", left: 0, top: y - 12, overflow: "visible" }}>
      <line x1={540 - half} y1={12} x2={540 + half} y2={12} stroke={colors.rule} strokeWidth={1.5} />
      {dinkus ? (
        <g transform={`translate(540 12) rotate(45) scale(${p})`}>
          <rect x={-7} y={-7} width={14} height={14} fill={colors.bg} stroke={colors.accent} strokeWidth={2} />
          <rect x={-3} y={-3} width={6} height={6} fill={colors.accent} />
        </g>
      ) : null}
    </svg>
  );
};

/**
 * Standalone title card, first in the film. It is LinkedIn's preview frame, so it is moving from
 * frame 0: the arcs draw on, the emblem draws, the title lands inside 0.4 s.
 */
export const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Frame 0 is the preview frame, so nothing may be blank on it: every entrance starts a few
  // frames "early" and is already partly on screen at frame 0, then keeps moving.
  const lead = 6;
  const arcsDraw = enter(frame + lead, 0, sec(1.6, fps));
  const markIn = enter(frame + lead, 0, sec(0.5, fps));
  const titleIn = enter(frame + lead, 0, sec(0.4, fps));
  const subIn = enter(frame + lead, sec(0.2, fps), sec(0.5, fps));

  return (
    <SceneShell sceneId={ID} tone="deep">
      <AbsoluteFill>
        <Arcs width={1080} height={1080} draw={arcsDraw} drift={-frame * 0.15} corner="bottom-right" />
        {VARIANT === "glow" ? (
          <div
            style={{
              position: "absolute",
              left: 140,
              top: 300,
              width: 800,
              height: 380,
              borderRadius: "50%",
              background: `radial-gradient(ellipse at center, ${colors.accentSoft} 0%, transparent 65%)`,
              opacity: 0.9 * titleIn,
            }}
          />
        ) : null}
        {VARIANT === "rules" || VARIANT === "glow" ? <Rule y={302} width={520} enter={markIn} /> : null}
        {VARIANT === "frame" ? (
          <svg width={1080} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
            <rect x={150} y={280} width={780} height={400} fill="none" stroke={colors.rule} strokeWidth={1.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - arcsDraw} />
            {([[150, 280], [930, 280], [150, 680], [930, 680]] as const).map(([x, y], i) => (
              <g key={i} opacity={titleIn}>
                <line x1={x} y1={y} x2={x + (x < 540 ? 26 : -26)} y2={y} stroke={colors.accent} strokeWidth={3} />
                <line x1={x} y1={y} x2={x} y2={y + (y < 480 ? 26 : -26)} stroke={colors.accent} strokeWidth={3} />
              </g>
            ))}
          </svg>
        ) : null}
        <div style={{ position: "absolute", left: 0, width: 1080, top: 330, display: "flex", justifyContent: "center" }}>
          <PyramidMark width={92} enter={markIn} topFill={colors.accent} />
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            width: 1080,
            top: 420,
            textAlign: "center",
            fontFamily: fonts.display,
            fontWeight: 600,
            fontSize: 124,
            lineHeight: 1,
            letterSpacing: "-0.01em",
            color: colors.fg,
            opacity: titleIn,
            translate: `0px ${(1 - titleIn) * 18}px`,
          }}
        >
          Answer First
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            width: 1080,
            top: 580,
            textAlign: "center",
            fontFamily: fonts.body,
            fontSize: 30,
            letterSpacing: "0.06em",
            color: colors.fg,
            opacity: subIn,
            translate: `0px ${(1 - subIn) * 10}px`,
          }}
        >
          Barbara Minto and the Pyramid Principle
        </div>
        {VARIANT === "rules" || VARIANT === "glow" ? <Rule y={560} width={520} enter={subIn} dinkus /> : null}
        {VARIANT === "rules" ? <Rule y={650} width={520} enter={subIn} /> : null}
      </AbsoluteFill>
    </SceneShell>
  );
};
