import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneShell, useNarrationStart } from "../components/SceneShell";
import { enter, sec } from "../components/motion";
import { HookPage, PAGE, PAGE_ORIGIN_DY, PAGE_ROOT } from "../components/HookPage";
import { beatStart, cue } from "../narration";
import { colors, easeInOut, fonts } from "../theme";

const ID = "01-hook";

/** Deterministic pseudo-random for the flicking slide cards. */
const seeded = (n: number): number => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const CARD = { x: 300, y: 560, w: 520 } as const;
const CARD_H = Math.round((CARD.w * 9) / 16);

/** One grey placeholder slide: ink outline, a title bar, a few bullet bars. */
const GreyCard: React.FC<{ seed: number; opacity: number; dx: number }> = ({ seed, opacity, dx }) => {
  const titleW = 0.45 + seeded(seed) * 0.4;
  const bullets = 3 + Math.floor(seeded(seed + 7) * 3);
  return (
    <div
      style={{
        position: "absolute",
        left: CARD.x,
        top: CARD.y,
        width: CARD.w,
        height: CARD_H,
        boxSizing: "border-box",
        border: `2px solid ${colors.ink}`,
        borderRadius: 6,
        backgroundColor: colors.paper,
        padding: 30,
        opacity,
        translate: `${dx}px 0px`,
      }}
    >
      <div style={{ height: 16, width: `${titleW * 100}%`, backgroundColor: colors.rule, borderRadius: 3 }} />
      <div style={{ height: 2, backgroundColor: colors.inkFaint, margin: "16px 0" }} />
      {Array.from({ length: bullets }, (_, i) => (
        <div
          key={i}
          style={{
            height: 10,
            width: `${(0.5 + seeded(seed * 3 + i) * 0.45) * 100}%`,
            backgroundColor: colors.inkFaint,
            borderRadius: 3,
            marginBottom: 14,
          }}
        />
      ))}
    </div>
  );
};

/**
 * Cold open. A slide counter races to 31, the room empties, a rail marks 1966, and the buried
 * recommendation rises to become the one-page pyramid the film promises.
 */
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t0 = useNarrationStart(ID);
  const at = (s: number): number => t0 + sec(s, fps);
  const b = (i: number): number => at(beatStart(ID, i));

  // --- timings (seconds from narration start), keyed to words of script v6 ---
  const raceStart = cue(ID, "recommendation", 3.4);
  const raceEnd = cue(ID, "thirty-one", raceStart + 1.6); // counter hits 31 on "thirty-one"
  const flipStart = raceEnd + 0.15;
  const roomCut = cue(ID, "room", raceEnd + 1.0) - 0.3;
  const rewindEnd = roomCut + 1.0;
  const dimStart = roomCut + 0.5;
  const dimEnd = cue(ID, "six", roomCut + 2.1) + 0.25;
  const whip = beatStart(ID, 1) - 0.1;
  const railStart = whip + 0.5;
  const wroteAt = cue(ID, "wrote", beatStart(ID, 1) + 3.9);
  const thoughtAt = cue(ID, "thought", beatStart(ID, 1) + 6.4);
  const pageStart = cue(ID, "single", beatStart(ID, 2) + 0.6) - 0.4;

  // --- counter ---
  const slowCount = interpolate(frame, [at(0.2), at(raceStart)], [1, 4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const raceCount = interpolate(frame, [at(raceStart), at(raceEnd)], [4, 31], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => t * t * (3 - 2 * t) * 0.6 + t * 0.4,
  });
  const rewind = interpolate(frame, [at(roomCut), at(rewindEnd)], [31, 6], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
  const count = frame < at(raceStart) ? slowCount : frame < at(roomCut) ? raceCount : rewind;
  const n = Math.max(1, Math.floor(count));
  const tick = count - Math.floor(count); // fraction into the current number, for card flick offset
  const counterIn = 1; // visible from frame 0: the first frame a muted viewer sees is the counter
  const whipP = enter(frame, at(whip), sec(0.35, fps));
  const counterOpacity = counterIn * (1 - whipP);

  // --- cards ---
  const flipP = interpolate(frame, [at(flipStart), at(flipStart + 0.45)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
  const flipped = flipP >= 0.5;
  const scaleX = Math.abs(1 - flipP * 2); // 1 → 0 → 1
  const cardIn = enter(frame, 0, sec(0.5, fps));
  const cardsOut = 1 - enter(frame, at(roomCut), sec(0.25, fps));

  // --- room dots ---
  const dotsIn = enter(frame, at(roomCut + 0.05), sec(0.3, fps));
  const dimmed = interpolate(frame, [at(dimStart), at(dimEnd)], [0, 7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dotsOpacity = dotsIn * (1 - whipP);

  // --- rail / 1966 ---
  const railP = enter(frame, at(railStart), sec(1.0, fps));
  const yearIn = enter(frame, at(railStart + 0.3), sec(0.5, fps));
  const wroteIn = enter(frame, at(wroteAt - 0.1), sec(0.5, fps));
  const strikeIn = enter(frame, at(thoughtAt - 0.35), sec(0.35, fps));
  const thoughtIn = enter(frame, at(thoughtAt - 0.1), sec(0.5, fps));
  const railOut = 1 - enter(frame, at(pageStart - 0.5), sec(0.35, fps));

  // --- page assembly ---
  // The recommendation starts drifting up from the card as soon as beat 4 begins, and lands on the
  // page's answer box just after beat 5 starts: beats 4→5 are one continuous move.
  const lineRise = interpolate(frame, [at(pageStart - 0.8), at(pageStart + 0.45)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
  const rootIn = enter(frame, at(pageStart + 0.45), 8);
  const reasonsIn: [number, number, number] = [
    enter(frame, at(pageStart + 0.75), sec(0.5, fps)),
    enter(frame, at(pageStart + 0.9), sec(0.5, fps)),
    enter(frame, at(pageStart + 1.05), sec(0.5, fps)),
  ];
  const dashesIn = enter(frame, at(pageStart + 1.15), sec(0.9, fps));
  const outlineIn = enter(frame, at(pageStart + 1.7), sec(1.0, fps));

  // --- the name payoff (beat 6): the page shrinks up a little and her name sets beneath it ---
  const nameStart = cue(ID, "knows", beatStart(ID, 2) + 5.8) - 0.5;
  const pageShrink = enter(frame, at(nameStart), sec(0.7, fps));
  const nameIn = enter(frame, at(nameStart + 0.25), sec(0.7, fps));


  return (
    <SceneShell sceneId={ID}>
      <AbsoluteFill>
        {/* Counter: the first thing a muted viewer sees, already changing. */}
        <div
          style={{
            position: "absolute",
            left: 0,
            width: 1080,
            top: 150,
            textAlign: "center",
            fontFamily: fonts.display,
            fontWeight: 600,
            fontSize: 320,
            lineHeight: 1,
            color: colors.ink,
            opacity: counterOpacity,
            translate: `${-whipP * 220}px 0px`,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {n}
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            width: 1080,
            top: 486,
            textAlign: "center",
            fontFamily: fonts.body,
            fontSize: 22,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: colors.inkSoft,
            opacity: counterOpacity,
            translate: `${-whipP * 220}px 0px`,
          }}
        >
          Slide
        </div>

        {/* Slide cards flicking past, then the flip to the buried recommendation. */}
        {frame < at(roomCut + 0.3) && !flipped ? (
          <>
            {n > 1 ? <GreyCard seed={n - 1} opacity={cardIn * cardsOut * (1 - tick) * 0.6} dx={-tick * 40} /> : null}
            <GreyCard seed={n} opacity={cardIn * cardsOut} dx={(1 - tick) * 24} />
          </>
        ) : null}
        <div
          style={{
            position: "absolute",
            left: CARD.x,
            top: CARD.y,
            width: CARD.w,
            height: CARD_H,
            scale: `${scaleX} 1`,
            opacity: flipP > 0 ? cardsOut : 0,
          }}
        >
          {flipped ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                boxSizing: "border-box",
                border: `2px solid ${colors.ink}`,
                borderRadius: 6,
                backgroundColor: colors.paper,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 30,
                textAlign: "center",
                fontFamily: fonts.display,
                fontWeight: 600,
                fontSize: 34,
                lineHeight: 1.2,
                color: colors.ink,
              }}
            >
              Recommendation: raise the price 8%
            </div>
          ) : (
            <GreyCard seed={31} opacity={1} dx={0} />
          )}
        </div>
        {/* Rising recommendation line (bridge from the card to the page's answer box). It lands on
            the answer box's exact geometry so the crossfade into the box text is seamless. */}
        {lineRise > 0 && rootIn < 1 ? (
          <div
            style={{
              position: "absolute",
              left: interpolate(lineRise, [0, 1], [CARD.x + 20, PAGE.x + (PAGE.w - PAGE_ROOT.w) / 2]),
              top: interpolate(lineRise, [0, 1], [CARD.y + 20, PAGE.y + PAGE_ORIGIN_DY]),
              width: interpolate(lineRise, [0, 1], [CARD.w - 40, PAGE_ROOT.w]),
              height: interpolate(lineRise, [0, 1], [CARD_H - 40, PAGE_ROOT.h]),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "0 17px",
              boxSizing: "border-box",
              fontFamily: fonts.display,
              fontWeight: 600,
              fontSize: interpolate(lineRise, [0, 1], [34, 34]),
              lineHeight: 1.15,
              color: colors.ink,
              opacity: 1 - rootIn,
            }}
          >
            Raise the price of the core plan 8% in January
          </div>
        ) : null}

        {/* The room: eight attendees, seven of whom stop listening. */}
        <div style={{ position: "absolute", left: 0, width: 1080, top: 620, display: "flex", justifyContent: "center", gap: 34, opacity: dotsOpacity, translate: `${-whipP * 220}px 0px` }}>
          {Array.from({ length: 8 }, (_, i) => {
            // Dim from the left; the last (rightmost) dot stays lit.
            const dimP = Math.max(0, Math.min(1, dimmed - i));
            return (
              <div
                key={i}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: "50%",
                  backgroundColor: colors.ink,
                  opacity: 1 - dimP * 0.86,
                  scale: `${1 - dimP * 0.25}`,
                }}
              />
            );
          })}
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            width: 1080,
            top: 700,
            textAlign: "center",
            fontFamily: fonts.body,
            fontSize: 22,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: colors.inkSoft,
            opacity: dotsOpacity,
            translate: `${-whipP * 220}px 0px`,
          }}
        >
          The room
        </div>

        {/* Rail with a single tick, 1966, and the idea of the beat: she was asked to fix "wrote"
            and came back fixing "thought". */}
        <svg style={{ position: "absolute", left: 0, top: 0, opacity: railOut }} width={1080} height={1080}>
          <path d="M 140 300 H 940" fill="none" stroke={colors.fg} strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - railP} opacity={railP > 0 ? 1 : 0} />
          <path d="M 540 284 V 316" fill="none" stroke={colors.fg} strokeWidth={2} opacity={yearIn} />
        </svg>
        <div
          style={{
            position: "absolute",
            left: 0,
            width: 1080,
            top: 336,
            textAlign: "center",
            fontFamily: fonts.body,
            fontSize: 22,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: colors.fgSoft,
            opacity: yearIn * railOut,
          }}
        >
          1966 · McKinsey · London
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
            fontSize: 132,
            lineHeight: 1,
            color: colors.fg,
            opacity: wroteIn * railOut * (1 - strikeIn * 0.5),
            translate: `0px ${(1 - wroteIn) * 14}px`,
          }}
        >
          wrote
          <svg style={{ position: "absolute", left: 0, top: 0 }} width={1080} height={140}>
            <path d="M 380 76 H 700" fill="none" stroke={colors.accent} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - strikeIn} opacity={strikeIn > 0 ? 1 : 0} />
          </svg>
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            width: 1080,
            top: 580,
            textAlign: "center",
            fontFamily: fonts.display,
            fontWeight: 600,
            fontSize: 132,
            lineHeight: 1,
            color: colors.accent,
            opacity: thoughtIn * railOut,
            translate: `0px ${(1 - thoughtIn) * 14}px`,
          }}
        >
          thought
        </div>

        {/* The page. */}
        <HookPage rootIn={rootIn} reasonsIn={reasonsIn} dashesIn={dashesIn} outlineIn={outlineIn} scale={1 - pageShrink * 0.14} />
        <div
          style={{
            position: "absolute",
            left: 0,
            width: 1080,
            top: PAGE.y + PAGE.h * 0.86 + 34,
            textAlign: "center",
            fontFamily: fonts.display,
            fontWeight: 600,
            fontSize: 64,
            lineHeight: 1,
            color: colors.fg,
            opacity: nameIn,
            translate: `0px ${(1 - nameIn) * 14}px`,
          }}
        >
          Barbara Minto
        </div>

      </AbsoluteFill>
    </SceneShell>
  );
};
