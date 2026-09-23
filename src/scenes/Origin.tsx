import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneShell, useNarrationStart } from "../components/SceneShell";
import { enter, sec } from "../components/motion";
import { OriginDotGrid } from "../components/OriginDotGrid";
import { DocumentLines, makeDocLines } from "../components/DocumentLines";
import { SectionRail } from "../components/SectionRail";
import { OriginRail } from "../components/OriginRail";
import { OriginMarks, OriginRays, makeProofMarks, makeRays } from "../components/OriginMarks";
import { beatEnd, beatStart, cue } from "../narration";
import { colors, fonts } from "../theme";

const ID = "04-origin";

const RAIL_Y = 800;
const RAIL_X0 = 120;
const STOP_X = { cleveland: 150, cambridge: 420, london: 690, oil: 810, today: 950 } as const;

const EIGHT = new Set([37, 112, 188, 251, 323, 402, 466, 559]);

/**
 * Scene 04 — Origin, keyed to the five beats of script v6:
 *   0 Harvard, no degree, 8 of 600 · 1 McKinsey, "the experiment" · 2 London, thinking not language ·
 *   3 1973: cut, stayed, own firm, taught the world · 4 She still does.
 * Motion is keyed to beat boundaries plus fractions of each beat, so re-worded narration keeps
 * working; `cue()` is used only with a fractional fallback for words that appear in every draft.
 */
export const Origin: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t0 = useNarrationStart(ID);
  const at = (s: number): number => t0 + sec(s, fps);
  const b = (i: number): number => at(beatStart(ID, i));
  const bEnd = (i: number): number => at(beatEnd(ID, i));
  /** Frame at `frac` of the way through beat i. */
  const bAt = (i: number, frac: number): number => at(beatStart(ID, i) + (beatEnd(ID, i) - beatStart(ID, i)) * frac);
  /** Frame at which `word` is spoken, if it exists in this draft; else `frac` through beat i. */
  const wordOr = (word: string, i: number, frac: number): number => {
    const fallback = beatStart(ID, i) + (beatEnd(ID, i) - beatStart(ID, i)) * frac;
    const t = cue(ID, word, -1);
    const inBeat = t >= beatStart(ID, i) && t <= beatEnd(ID, i);
    return at(inBeat ? t : fallback);
  };

  const docLines = useMemo(() => makeDocLines(15, 7, ["Background", "Approach"]), []);
  const marks = useMemo(() => makeProofMarks(34, 11, { x: 108, y: 250, w: 350, h: 15 * 24, lineH: 24 }), []);
  const rays = useMemo(() => makeRays(46, 5, { x: 88, y: 200, w: 904, h: 440 }), []);

  const railIn = enter(frame, 0, sec(0.9, fps));

  // ----- rail progress: Cleveland from frame 0, Cambridge in beat 0, London in beat 2, 1973 + today in beats 3–4 -----
  const railTo = interpolate(
    frame,
    [0, sec(0.4, fps), bAt(0, 0.45), bAt(0, 0.65), b(2), bAt(2, 0.25), bAt(3, 0.05), bAt(3, 0.25), b(4), bEnd(4)],
    [RAIL_X0, STOP_X.cleveland, STOP_X.cleveland, STOP_X.cambridge, STOP_X.cambridge, STOP_X.london, STOP_X.london, STOP_X.oil, STOP_X.oil, STOP_X.today],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // ----- beat 0: her name, then 8 of 600 -----
  const nameIn = enter(frame, b(0), sec(0.9, fps));
  const nameOut = 1 - enter(frame, bAt(0, 0.55), sec(0.5, fps));
  const gridReveal = enter(frame, bAt(0, 0.5), sec(2.4, fps));
  const eightIn = enter(frame, wordOr("eight", 0, 0.8), sec(0.7, fps));
  const statIn = enter(frame, wordOr("hundred", 0, 0.9), sec(0.8, fps));
  const gridOut = 1 - enter(frame, b(1), sec(0.6, fps));

  // ----- beat 1: McKinsey, "the experiment" -----
  const hiredIn = enter(frame, b(1) + sec(0.1, fps), sec(0.8, fps));
  const expIn = enter(frame, wordOr("experiment", 1, 0.75) - sec(0.3, fps), sec(0.8, fps));
  const beat1Out = 1 - enter(frame, b(2), sec(0.5, fps));

  // ----- beat 2: the page, red pen, thinking / language -----
  const docIn = enter(frame, b(2) + sec(0.2, fps), sec(0.8, fps));
  const docShown = interpolate(frame, [b(2) + sec(0.2, fps), b(2) + sec(1.4, fps)], [0, docLines.length], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const markStart = wordOr("writing", 2, 0.35);
  const markEnd = wordOr("thinking", 2, 0.75);
  const markT = interpolate(frame, [markStart, markEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const marksShown = marks.length * markT * markT;
  const thinkIn = enter(frame, wordOr("thinking", 2, 0.75), sec(0.8, fps));
  const langIn = enter(frame, wordOr("language", 2, 0.92) - sec(0.3, fps), sec(0.5, fps));
  const strike = enter(frame, wordOr("language", 2, 0.92), sec(0.6, fps));
  const beat2Out = 1 - enter(frame, b(3) + sec(0.2, fps), sec(0.6, fps));

  // ----- beat 3: the office is cut; she stays; her own firm; the spread -----
  const officeIn = enter(frame, b(3), sec(0.6, fps));
  const cutP = enter(frame, wordOr("crisis", 3, 0.2), sec(0.9, fps));
  const stayP = enter(frame, wordOr("stayed", 3, 0.42), sec(0.5, fps));
  const firmAt = wordOr("firm", 3, 0.62);
  const moveP = enter(frame, firmAt - sec(0.5, fps), sec(0.7, fps)); // her dot travels London -> 1973
  const firmIn = enter(frame, firmAt, sec(0.6, fps));
  const firmLabelIn = enter(frame, firmAt + sec(0.3, fps), sec(0.5, fps));
  const officeOut = 1 - enter(frame, firmAt + sec(0.2, fps), sec(0.8, fps));
  const raysP = interpolate(frame, [wordOr("taught", 3, 0.78), bEnd(3) + sec(0.8, fps)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const stopEnter = (x: number, startFrame: number): number =>
    interpolate(railTo, [x - 30, x], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
    enter(frame, startFrame, sec(0.4, fps));

  return (
    <SceneShell sceneId={ID}>
      <AbsoluteFill>
        <SectionRail current={1} enter={railIn} />

        {/* beat 0: her name */}
        <div style={{ position: "absolute", left: 88, top: 300, opacity: nameIn * nameOut }}>
          <div
            style={{
              fontFamily: fonts.display,
              fontWeight: 600,
              fontSize: 128,
              lineHeight: 0.98,
              color: colors.fg,
              translate: `0px ${(1 - nameIn) * 18}px`,
            }}
          >
            Barbara
            <br />
            Minto
          </div>
        </div>

        {/* beat 0: 600 dots, 8 in accent */}
        <div style={{ position: "absolute", left: 0, top: 0, opacity: gridOut }}>
          <OriginDotGrid
            count={600}
            columns={30}
            cell={22}
            dot={9}
            reveal={gridReveal}
            highlight={EIGHT}
            highlightStrength={eightIn}
            style={{ left: 88, top: 250 }}
          />
          <div style={{ position: "absolute", left: 790, top: 330, opacity: statIn, translate: `0px ${(1 - statIn) * 14}px` }}>
            <div style={{ fontFamily: fonts.display, fontWeight: 600, fontSize: 150, lineHeight: 0.9, color: colors.accent }}>8</div>
            <div style={{ fontFamily: fonts.body, fontSize: 24, letterSpacing: "0.14em", color: colors.fgSoft, marginTop: 18 }}>
              OF 600
            </div>
          </div>
        </div>

        {/* beat 1: McKinsey 1963, "the experiment" */}
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1080, opacity: beat1Out }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 290,
              textAlign: "center",
              fontFamily: fonts.body,
              fontSize: 24,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: colors.fgSoft,
              opacity: hiredIn,
              translate: `0px ${(1 - hiredIn) * 8}px`,
            }}
          >
            McKinsey · 1963 · first woman MBA
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 380,
              textAlign: "center",
              fontFamily: fonts.displayItalic,
              fontStyle: "italic",
              fontSize: 132,
              lineHeight: 1,
              color: colors.fg,
              opacity: expIn,
              translate: `0px ${(1 - expIn) * 16}px`,
            }}
          >
            “the experiment”
          </div>
        </div>

        {/* beat 2: page of consultant prose + red pen, THINKING / LANGUAGE beside it */}
        <div style={{ position: "absolute", left: 0, top: 0, opacity: docIn * beat2Out }}>
          <div
            style={{
              position: "absolute",
              left: 88,
              top: 220,
              width: 390,
              height: 15 * 24 + 60,
              border: `2px solid ${colors.rule}`,
              borderRadius: 4,
              backgroundColor: colors.surface,
            }}
          />
          <DocumentLines lines={docLines} shown={docShown} width={350} lineHeight={24} x={108} y={250} />
          <OriginMarks marks={marks} shown={marksShown} />
        </div>
        <div style={{ position: "absolute", left: 520, width: 472, top: 300, textAlign: "left", opacity: beat2Out }}>
          <div
            style={{
              fontFamily: fonts.display,
              fontWeight: 600,
              fontSize: 112,
              lineHeight: 1,
              color: colors.fg,
              opacity: thinkIn,
              translate: `0px ${(1 - thinkIn) * 18}px`,
            }}
          >
            thinking
          </div>
          <div style={{ position: "relative", display: "inline-block", marginTop: 40, opacity: langIn }}>
            <div style={{ fontFamily: fonts.display, fontWeight: 400, fontSize: 76, lineHeight: 1, color: colors.fgSoft }}>
              language
            </div>
            <svg style={{ position: "absolute", left: -8, top: "50%", overflow: "visible" }} width={350} height={20}>
              <path
                d="M 0 10 Q 175 2 350 12"
                fill="none"
                stroke={colors.accent}
                strokeWidth={6}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - strike}
              />
            </svg>
          </div>
        </div>

        {/* beat 3: the London office, cut to one */}
        <div style={{ position: "absolute", left: 0, top: 0, opacity: officeIn * officeOut }}>
          {Array.from({ length: 9 }, (_, i) => {
            const isHer = i === 4;
            const leaves = !isHer && [0, 2, 3, 6, 8].includes(i);
            const gone = leaves ? cutP : 0;
            const size = isHer ? 18 + 6 * stayP : 14;
            const homeX = STOP_X.london - 4 * 30 + i * 30;
            const x = isHer ? homeX + (STOP_X.oil - homeX) * moveP : homeX;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: x - size / 2,
                  top: RAIL_Y - 96 - size / 2 - (isHer ? 0 : gone * 30),
                  width: size,
                  height: size,
                  borderRadius: "50%",
                  backgroundColor: isHer ? colors.accent : colors.fg,
                  opacity: isHer ? 1 - firmIn : 1 - gone,
                }}
              />
            );
          })}
        </div>

        {/* beat 3: her own firm, beside London */}
        <div style={{ position: "absolute", left: 0, top: 0, opacity: firmIn }}>
          <div
            style={{
              position: "absolute",
              left: STOP_X.oil - 14,
              top: RAIL_Y - 96 - 14,
              width: 28,
              height: 28,
              boxSizing: "border-box",
              border: `3px solid ${colors.accent}`,
              borderRadius: 4,
              backgroundColor: colors.surface,
              scale: `${0.6 + 0.4 * firmIn}`,
              boxShadow: `0 0 ${16 * firmIn}px ${colors.accentSoft}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: STOP_X.oil + 26,
              top: RAIL_Y - 96 - 12,
              fontFamily: fonts.body,
              fontSize: 20,
              letterSpacing: "0.16em",
              color: colors.accent,
              whiteSpace: "nowrap",
              opacity: firmLabelIn,
              translate: `${(1 - firmLabelIn) * -6}px 0px`,
            }}
          >
            MINTO INTL · 1973
          </div>
        </div>

        {/* beats 3–4: lines radiate from London */}
        <OriginRays from={{ x: STOP_X.oil, y: RAIL_Y - 96 }} rays={rays} progress={raysP} />

        <OriginRail
          y={RAIL_Y}
          x0={RAIL_X0}
          drawnToX={railTo}
          stops={[
            { x: STOP_X.cleveland, label: "CLEVELAND", enter: stopEnter(STOP_X.cleveland, 0) },
            { x: STOP_X.cambridge, label: "CAMBRIDGE", year: "1963", enter: stopEnter(STOP_X.cambridge, bAt(0, 0.45)) },
            { x: STOP_X.london, label: "LONDON", year: "1966", enter: stopEnter(STOP_X.london, b(2)) },
            { x: STOP_X.oil, year: "1973", enter: stopEnter(STOP_X.oil, b(3)) },
            { x: STOP_X.today, label: "TODAY", enter: stopEnter(STOP_X.today, b(4)) },
          ]}
        />
      </AbsoluteFill>
    </SceneShell>
  );
};
