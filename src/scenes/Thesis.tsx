import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneShell, useNarrationStart } from "../components/SceneShell";
import { PyramidMark } from "../components/ThesisMark";
import { SectionRail } from "../components/SectionRail";
import { enter, sec } from "../components/motion";
import { beatEnd, beatStart, cue } from "../narration";
import { colors, fonts, layout } from "../theme";

const ID = "03-thesis";

const SUPPORTS = [
  { label: "Origin", sub: "where it came from", cueText: "where it came" },
  { label: "Technique", sub: "how it works", cueText: "how it works" },
  { label: "Reach", sub: "how far it spread", cueText: "how far" },
] as const;

const TOP = { x: layout.margin, y: 240, w: 1080 - layout.margin * 2, h: 316 } as const;
const ROW = { y: 704, h: 124, boxW: 268, gap: 32 } as const;

/** A stopwatch glyph: circle, crown, one hand. */
const Stopwatch: React.FC<{ size: number; enter: number }> = ({ size, enter: p }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ overflow: "visible" }}>
    <circle cx={20} cy={22} r={15} fill="none" stroke={colors.ink} strokeWidth={2.2} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
    <path d="M 17 4 H 23 M 20 4 V 8" fill="none" stroke={colors.ink} strokeWidth={2.2} opacity={p} />
    <path d="M 20 22 V 12" fill="none" stroke={colors.accent} strokeWidth={2.6} strokeLinecap="round" opacity={p} style={{ transformOrigin: "20px 22px", rotate: `${p * 60}deg` }} />
  </svg>
);

/** A long ruler glyph with ticks; `length` in px. */
const Ruler: React.FC<{ length: number; enter: number }> = ({ length, enter: p }) => {
  const ticks = 14;
  return (
    <svg width={length} height={30} style={{ overflow: "visible" }}>
      <path d={`M 0 22 H ${length}`} fill="none" stroke={colors.ink} strokeWidth={2.2} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      {Array.from({ length: ticks + 1 }, (_, i) => {
        const x = (length / ticks) * i;
        const tall = i % 2 === 0;
        return <path key={i} d={`M ${x} 22 V ${tall ? 8 : 14}`} stroke={colors.ink} strokeWidth={2} opacity={p * ticks >= i ? 1 : 0} />;
      })}
    </svg>
  );
};

/**
 * "Slide one" of the film: the answer box holds the emblem and the title, not a sentence;
 * the three supports beneath are the film's own outline, redrawn by the reveal.
 */
export const Thesis: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t0 = useNarrationStart(ID);
  const at = (s: number): number => t0 + sec(s, fps);

  const eyebrowIn = enter(frame, at(-0.2), sec(0.6, fps));
  const boxIn = enter(frame, at(beatStart(ID, 0) + 0.05), sec(0.9, fps));
  const markIn = boxIn; // emblem draws with the box so slide one never shows an empty rectangle
  const titleIn = enter(frame, at(cue(ID, "Pyramid", beatStart(ID, 0) + 0.6)), sec(0.7, fps));
  const watchIn = enter(frame, at(cue(ID, "minutes", beatStart(ID, 1) + 1.0) - 0.2), sec(0.8, fps));
  const rulerIn = enter(frame, at(cue(ID, "takes years", beatStart(ID, 1) + 3.0) - 0.3), sec(1.2, fps));
  const wellAt = cue(ID, "well beyond", beatEnd(ID, 0) - 0.8);
  const gridUp = interpolate(frame, [at(wellAt - 0.2), at(wellAt + 0.6), at(beatEnd(ID, 0) + 0.3), at(beatEnd(ID, 0) + 1.0)], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const rowW = ROW.boxW * 3 + ROW.gap * 2;
  const rowX = (1080 - rowW) / 2;
  const trunkY = TOP.y + TOP.h;
  const midY = (trunkY + ROW.y) / 2;

  return (
    <SceneShell sceneId={ID}>
      <AbsoluteFill>
        <SectionRail current={0} enter={eyebrowIn} />

        {/* Faint grid of many organisations, behind the answer box. */}
        <div
          style={{
            position: "absolute",
            left: 88,
            top: 190,
            width: 904,
            height: 440,
            display: "grid",
            gridTemplateColumns: "repeat(20, 1fr)",
            gap: 8,
            opacity: gridUp * 0.55,
            scale: `${1 + gridUp * 0.03}`,
            transformOrigin: "50% 50%",
          }}
        >
          {Array.from({ length: 180 }, (_, i) => (
            <div key={i} style={{ height: 38, border: `1.5px solid ${colors.inkFaint}`, borderRadius: 3 }} />
          ))}
        </div>

        {/* The answer box: emblem + title, no sentence. */}
        <div
          style={{
            position: "absolute",
            left: TOP.x,
            top: TOP.y,
            width: TOP.w,
            height: TOP.h,
            boxSizing: "border-box",
            border: `2px solid ${colors.ink}`,
            borderRadius: 4,
            backgroundColor: colors.paper,
            opacity: boxIn,
            translate: `0px ${(1 - boxIn) * 16}px`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
          }}
        >
          <PyramidMark width={110} enter={markIn} />
          <div
            style={{
              fontFamily: fonts.display,
              fontWeight: 600,
              fontSize: 76,
              lineHeight: 1,
              color: colors.ink,
              opacity: titleIn,
              translate: `0px ${(1 - titleIn) * 10}px`,
            }}
          >
            Answer First
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 40, marginTop: 10, height: 44 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, opacity: watchIn > 0 ? 1 : 0 }}>
              <Stopwatch size={40} enter={watchIn} />
              <span style={{ fontFamily: fonts.body, fontSize: 24, color: colors.inkSoft, opacity: watchIn }}>1 min</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, opacity: rulerIn > 0 ? 1 : 0 }}>
              <Ruler length={300} enter={rulerIn} />
              <span style={{ fontFamily: fonts.body, fontSize: 24, color: colors.inkSoft, opacity: rulerIn }}>a career</span>
            </div>
          </div>
        </div>

        {/* Connectors + three supports. */}
        {SUPPORTS.map((s, i) => {
          const start = at(cue(ID, s.cueText, beatStart(ID, 2) + 0.8 + i * 1.0) - 0.15);
          const p = enter(frame, start, sec(0.9, fps));
          const x = rowX + i * (ROW.boxW + ROW.gap);
          const cx = x + ROW.boxW / 2;
          return (
            <React.Fragment key={s.label}>
              <svg style={{ position: "absolute", left: 0, top: 0 }} width={1080} height={1080}>
                <path
                  d={`M 540 ${trunkY} V ${midY} H ${cx} V ${ROW.y}`}
                  fill="none"
                  stroke={colors.rule}
                  strokeWidth={2}
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - p}
                  opacity={p > 0 ? 1 : 0}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  left: x,
                  top: ROW.y,
                  width: ROW.boxW,
                  height: ROW.h,
                  border: `2px solid ${colors.ink}`,
                  borderRadius: 4,
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  opacity: p,
                  translate: `0px ${(1 - p) * 14}px`,
                  backgroundColor: colors.paper,
                }}
              >
                <div style={{ fontFamily: fonts.body, fontWeight: 600, fontSize: 30, color: colors.ink }}>{s.label}</div>
                <div style={{ fontFamily: fonts.body, fontSize: 22, color: colors.inkSoft }}>{s.sub}</div>
              </div>
            </React.Fragment>
          );
        })}
      </AbsoluteFill>
    </SceneShell>
  );
};
