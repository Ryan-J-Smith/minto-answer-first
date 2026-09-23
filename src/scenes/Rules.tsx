import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneShell, useNarrationStart } from "../components/SceneShell";
import { enter, sec } from "../components/motion";
import { SectionRail } from "../components/SectionRail";
import { beatStart, beatEnd, cue, getNarration } from "../narration";
import { colors, easeInOut, fonts } from "../theme";

const ID = "05-rules";

/** Seconds at which the LAST occurrence of `phrase` starts (cue() finds the first). */
const lastCue = (sceneId: string, phrase: string, fallbackSec: number): number => {
  const scene = getNarration(sceneId);
  if (!scene) return fallbackSec;
  const norm = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const target = phrase.split(/\s+/).map(norm).filter(Boolean);
  let found = fallbackSec;
  for (let i = 0; i + target.length <= scene.words.length; i++) {
    let ok = true;
    for (let j = 0; j < target.length; j++) {
      if (norm(scene.words[i + j]?.text ?? "") !== target[j]) {
        ok = false;
        break;
      }
    }
    if (ok) found = (scene.words[i]?.startMs ?? 0) / 1000;
  }
  return found;
};

/** Geometry of the one-page pyramid. Everything is absolute so the rule demos can nudge boxes. */
const CX = 500; // pyramid centre x (leaves room for the numbered margin on the right)
const ANS = { x: CX - 330, y: 214, w: 660, h: 124 };
const REASON_W = 252;
const REASON_GAP = 24;
const REASON_Y = 418;
const REASON_H = 112;
const ROW_W = REASON_W * 3 + REASON_GAP * 2;
const ROW_X = CX - ROW_W / 2;
const EV_Y = 588;
const EV_ROW_H = 46;
const MARGIN_X = 964;

const REASONS = [
  { id: "cust", text: "Customers will stay", evidence: ["94% renewed", "value 4.6 / 5", "1 segment risk"] },
  { id: "comp", text: "Competitors already moved", evidence: ["2 of 3 raised", "now lowest", "0 share lost"] },
  { id: "co", text: "We need the margin", evidence: ["costs +11%", "2 qtrs missed", "8% closes gap"] },
] as const;

const FILLERS = ["Background", "Method", "Context"] as const;

const MECE = [
  { letter: "M", word: "mutually", cueText: "Mutually" },
  { letter: "E", word: "exclusive", cueText: "exclusive" },
  { letter: "C", word: "collectively", cueText: "collectively" },
  { letter: "E", word: "exhaustive", cueText: "exhaustive" },
] as const;

const reasonX = (i: number): number => ROW_X + i * (REASON_W + REASON_GAP);

/**
 * Slide three: the technique. The pricing pyramid builds on a page, then three rules are
 * demonstrated on it in place: summarising, vertical Q&A, and MECE grouping.
 */
export const Rules: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t0 = useNarrationStart(ID);
  const at = (s: number): number => t0 + sec(s, fps);
  const t = (frame - t0) / fps; // seconds since narration start

  // --- beat 0: page, eyebrow, header

  // --- beat 0: a large three-box mark ("one shape") with 1 · 2 · 3 landing beside it ("three rules"),
  // then it shrinks into the answer-box position as beat 1 begins.
  const markIn = enter(frame, at(beatStart(ID, 0) + 0.05), sec(0.9, fps));
  const rulesAt = cue(ID, "three rules", beatStart(ID, 0) + 1.8);
  const markNums = [0, 1, 2].map((i) => enter(frame, at(rulesAt + i * 0.22), sec(0.45, fps)));
  const markOutAt = beatStart(ID, 1, 3.3) - 0.35;
  const markOut = interpolate(frame, [at(markOutAt), at(markOutAt + 0.7)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInOut,
  });
  const pageIn = interpolate(markOut, [0.3, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // --- beat 1: fillers stack, then are shoved off and the answer lands
  const b1 = beatStart(ID, 1, 3.3);
  // Fillers stack into the page while the opening mark is still on screen, so the page is never empty.
  const fillerCue = [markOutAt - 0.75, markOutAt - 0.5, markOutAt - 0.25];
  const shoveAt = lastCue(ID, "The answer", b1 + 3.5);
  const shove = interpolate(frame, [at(shoveAt), at(shoveAt + 0.55)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInOut,
  });
  const answerIn = enter(frame, at(shoveAt + 0.25), sec(0.8, fps));

  // --- beat 2: reasons, then evidence
  const reasonsAt = cue(ID, "Then the reasons", b1 + 4.6) + 0.2;
  const evidenceAt = cue(ID, "under those", b1 + 5.7);

  // --- beat 3: rule one — evidence glows, bracket draws, text condenses into the box
  const r1 = beatStart(ID, 2, 11.1);
  const margin1 = enter(frame, at(r1), sec(0.6, fps));
  const glowAt = cue(ID, "every box", r1 + 0.9);
  const glow = interpolate(frame, [at(glowAt), at(glowAt + 0.5), at(glowAt + 2.4), at(glowAt + 2.9)], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bracketAt = cue(ID, "sums up", r1 + 1.5);
  const bracket = enter(frame, at(bracketAt), sec(0.7, fps));
  const condense = interpolate(frame, [at(bracketAt + 0.5), at(bracketAt + 1.4)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInOut,
  });
  const condenseBack = interpolate(frame, [at(bracketAt + 2.2), at(bracketAt + 2.8)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInOut,
  });
  // 0 → 1 → 0: evidence rows fly up into the Customers box, then settle back.
  const fly = condense * (1 - condenseBack);
  const custPulse = interpolate(frame, [at(bracketAt + 1.2), at(bracketAt + 1.5), at(bracketAt + 2.4)], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- beat 4: rule two — WHY? and HOW DO WE KNOW? tags
  const r2 = beatStart(ID, 3, 14.7);
  const margin2 = enter(frame, at(r2), sec(0.6, fps));
  const whyAt = lastCue(ID, "why", r2 + 4.1);
  const howAt = lastCue(ID, "how", r2 + 5.1);
  const whyIn = enter(frame, at(whyAt), sec(0.5, fps));
  const howIn = enter(frame, at(howAt), sec(0.5, fps));
  const tagPulse = (start: number): number =>
    0.85 + 0.15 * Math.sin(Math.max(0, t - start) * 6);
  const tagsOut = interpolate(frame, [at(beatStart(ID, 4, 20.7) - 0.3), at(beatStart(ID, 4, 20.7) + 0.3)], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- beat 5: rule three — overlap, separate, gap, ghost, widen
  const r3 = beatStart(ID, 4, 20.7);
  const margin3 = enter(frame, at(r3), sec(0.6, fps));
  const orderAt = cue(ID, "sensible order", r3 + 3.8);
  const overlapAt = cue(ID, "no overlaps", r3 + 5.0);
  const gapAt = cue(ID, "no gaps", r3 + 6.1);
  const endR3 = gapAt + 1.35;
  // Overlap: outer boxes slide inward by 70px, then back.
  const overlap = interpolate(
    frame,
    [at(overlapAt), at(overlapAt + 0.35), at(overlapAt + 0.7), at(overlapAt + 1.0)],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut },
  );
  // Gap: the two right boxes slide right by 120px, opening a hole after the first box.
  const gapOpen = interpolate(frame, [at(gapAt), at(gapAt + 0.35)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInOut,
  });
  const ghostIn = interpolate(frame, [at(gapAt + 0.3), at(gapAt + 0.55), at(gapAt + 0.95), at(gapAt + 1.2)], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const gapClose = interpolate(frame, [at(gapAt + 1.05), at(endR3)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInOut,
  });
  const gapShift = 40 * gapOpen * (1 - gapClose);
  const orderIn = enter(frame, at(orderAt), sec(0.5, fps));
  const orderOut = interpolate(frame, [at(overlapAt - 0.1), at(overlapAt + 0.2)], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- beat 6: MECE letters
  const b6 = beatStart(ID, 5, 27.9);
  const meceAll = cue(ID, "MECE", beatEnd(ID, 5, 33.5) - 0.6);
  const meceWordIn = MECE.map((m, i) => enter(frame, at(cue(ID, m.cueText, b6 + 2.0 + i * 0.65)), sec(0.55, fps)));
  const mecePulse = interpolate(frame, [at(meceAll), at(meceAll + 0.25), at(meceAll + 0.9)], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const evidenceDim = interpolate(frame, [at(b6), at(b6 + 0.6)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const custCx = reasonX(0) + REASON_W / 2;
  const custCy = REASON_Y + REASON_H / 2;

  const boxDx = (i: number): number => {
    const inward = i === 0 ? 70 : i === 2 ? -70 : 0;
    const gap = i === 0 ? -gapShift : gapShift;
    return inward * overlap + gap;
  };

  return (
    <SceneShell sceneId={ID}>
      <AbsoluteFill>
        <SectionRail current={2} enter={pageIn} />

        {/* Beat 0: the big mark */}
        {(() => {
          const size = 1 - 0.55 * markOut; // shrinks toward the answer-box position
          const cx = 540 + (CX - 540) * markOut;
          const cy = 500 + (ANS.y + 90 - 500) * markOut;
          const topW = 420 * size;
          const topH = 110 * size;
          const kidW = 190 * size;
          const kidH = 90 * size;
          const kidGap = 26 * size;
          const rowW = kidW * 3 + kidGap * 2;
          const rowY = cy - 60 * size + topH + 80 * size;
          const stroke = colors.fg;
          return (
            <div style={{ position: "absolute", left: 0, top: 0, opacity: markIn * (1 - markOut) }}>
              <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1080} height={1080}>
                <rect x={cx - topW / 2} y={cy - 60 * size} width={topW} height={topH} rx={5} fill={colors.surface} stroke={stroke} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - markIn} />
                {[0, 1, 2].map((i) => {
                  const x = cx - rowW / 2 + i * (kidW + kidGap);
                  const kcx = x + kidW / 2;
                  const y1 = cy - 60 * size + topH;
                  const midY = (y1 + rowY) / 2;
                  const p = interpolate(markIn, [0.35 + i * 0.12, 0.75 + i * 0.12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                  return (
                    <g key={i}>
                      <path d={`M ${cx} ${y1} V ${midY} H ${kcx} V ${rowY}`} fill="none" stroke={colors.rule} strokeWidth={2.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
                      <rect x={x} y={rowY} width={kidW} height={kidH} rx={5} fill={colors.surface} stroke={stroke} strokeWidth={3} opacity={p} />
                    </g>
                  );
                })}
              </svg>
              {[0, 1, 2].map((i) => {
                const p = markNums[i] ?? 0;
                const x = cx + rowW / 2 + 60;
                const ys = [cy - 60 * size + topH / 2, rowY + kidH / 2, rowY + kidH + 70 * size];
                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: x,
                      top: (ys[i] ?? 0) - 34,
                      width: 68,
                      height: 68,
                      borderRadius: "50%",
                      border: `2.5px solid ${colors.fg}`,
                      boxSizing: "border-box",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: fonts.display,
                      fontWeight: 600,
                      fontSize: 36,
                      color: colors.fg,
                      opacity: p,
                      scale: `${0.6 + 0.4 * p}`,
                    }}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>
          );
        })()}


        {/* Filler boxes: stack, then get shoved off */}
        {FILLERS.map((label, i) => {
          const p = enter(frame, at(fillerCue[i] ?? 0), sec(0.5, fps));
          const dir = i === 1 ? 1 : -1;
          const y = ANS.y + 8 + i * 38;
          return (
            <div
              key={label}
              style={{
                position: "absolute",
                left: ANS.x + 40,
                top: y,
                width: ANS.w - 80,
                height: 40,
                boxSizing: "border-box",
                border: `2px solid ${colors.fgFaint}`,
                borderRadius: 4,
                backgroundColor: colors.surface,
                display: "flex",
                alignItems: "center",
                paddingLeft: 18,
                fontFamily: fonts.body,
                fontSize: 22,
                color: colors.fgSoft,
                opacity: p * (1 - shove),
                translate: `${dir * shove * 900 + (1 - p) * 0}px ${(1 - p) * -14}px`,
                rotate: `${dir * shove * 6}deg`,
              }}
            >
              {label}
            </div>
          );
        })}

        {/* Answer box */}
        <div
          style={{
            position: "absolute",
            left: ANS.x,
            top: ANS.y,
            width: ANS.w,
            height: ANS.h,
            boxSizing: "border-box",
            border: `2.5px solid ${colors.fg}`,
            borderRadius: 4,
            backgroundColor: colors.surface,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 26px",
            fontFamily: fonts.display,
            fontWeight: 600,
            fontSize: 36,
            lineHeight: 1.15,
            color: colors.fg,
            opacity: answerIn,
            translate: `0px ${(1 - answerIn) * -30}px`,
          }}
        >
          Raise the price of the core plan 8% in January
        </div>

        {/* Connectors answer → reasons */}
        <svg style={{ position: "absolute", left: 0, top: 0 }} width={1080} height={1080}>
          {REASONS.map((r, i) => {
            const p = enter(frame, at(reasonsAt + i * 0.18), sec(0.7, fps));
            const cx = reasonX(i) + REASON_W / 2 + boxDx(i);
            const y1 = ANS.y + ANS.h;
            const midY = (y1 + REASON_Y) / 2;
            return (
              <path
                key={r.id}
                d={`M ${CX} ${y1} V ${midY} H ${cx} V ${REASON_Y}`}
                fill="none"
                stroke={colors.rule}
                strokeWidth={2}
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - p}
              />
            );
          })}
          {/* ghost fourth box when the gap opens */}
          <rect
            x={reasonX(0) + REASON_W - 38}
            y={REASON_Y}
            width={100}
            height={REASON_H}
            rx={4}
            fill="none"
            stroke={colors.accent}
            strokeWidth={2}
            strokeDasharray="8 6"
            opacity={ghostIn * 0.9}
          />
          {/* rule 1 bracket: from the evidence rows up into the Customers box */}
          {(() => {
            const x = reasonX(0) - 14;
            const yTop = REASON_Y + REASON_H;
            const yBot = EV_Y + EV_ROW_H * 3 - 6;
            return (
              <path
                d={`M ${x + 10} ${yBot} H ${x} V ${yTop + 8} H ${x + 10}`}
                fill="none"
                stroke={colors.accent}
                strokeWidth={2.5}
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - bracket}
                opacity={bracket * (1 - condenseBack)}
              />
            );
          })()}
        </svg>

        {/* Reason boxes */}
        {REASONS.map((r, i) => {
          const p = enter(frame, at(reasonsAt + i * 0.18), sec(0.7, fps));
          const isCust = i === 0;
          const pulse = isCust ? custPulse : 0;
          return (
            <div
              key={r.id}
              style={{
                position: "absolute",
                left: reasonX(i),
                top: REASON_Y,
                width: REASON_W,
                height: REASON_H,
                boxSizing: "border-box",
                border: `${2 + 1.5 * pulse}px solid ${pulse > 0 ? colors.accent : colors.fg}`,
                borderRadius: 4,
                backgroundColor: colors.surface,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "0 14px",
                fontFamily: fonts.body,
                fontWeight: 600,
                fontSize: 27,
                lineHeight: 1.15,
                color: colors.fg,
                opacity: p,
                translate: `${boxDx(i)}px ${(1 - p) * 14}px`,
                boxShadow: pulse > 0 ? `0 0 0 ${8 * pulse}px rgba(61,188,242,${0.18 * pulse})` : undefined,
                zIndex: i === 1 ? 2 : 1,
                overflow: "hidden",
              }}
            >
              <span style={{ opacity: i === 1 ? 1 : 1 - 0.6 * overlap }}>{r.text}</span>
            </div>
          );
        })}

        {/* Overlap tint: the intersections when outer boxes slide inward */}
        {[0, 1].map((k) => {
          const w = 70 * overlap - REASON_GAP;
          if (w <= 0) return null;
          const x = k === 0 ? reasonX(1) : reasonX(2) - w;
          return (
            <div
              key={k}
              style={{
                position: "absolute",
                left: x,
                top: REASON_Y,
                width: w,
                height: REASON_H,
                backgroundColor: colors.accentSoft,
                zIndex: 3,
              }}
            />
          );
        })}

        {/* Order numerals ("in order") */}
        {REASONS.map((r, i) => (
          <div
            key={`ord-${r.id}`}
            style={{
              position: "absolute",
              left: reasonX(i) + boxDx(i) + 10,
              top: REASON_Y - 34,
              fontFamily: fonts.display,
              fontSize: 22,
              color: colors.accent,
              opacity: orderIn * orderOut,
            }}
          >
            {i + 1}
          </div>
        ))}

        {/* Evidence rows */}
        {REASONS.map((r, i) =>
          r.evidence.map((e, j) => {
            const p = enter(frame, at(evidenceAt + i * 0.14 + j * 0.16), sec(0.55, fps));
            const isCust = i === 0;
            const rowX = reasonX(i) + 12 + boxDx(i);
            const rowY = EV_Y + j * EV_ROW_H;
            // rule 1: rows under Customers fly into the box and shrink
            const fx = isCust ? (custCx - 40 - rowX) * fly : 0;
            const fy = isCust ? (custCy - rowY) * fly : 0;
            const scale = isCust ? 1 - 0.8 * fly : 1;
            const hot = isCust ? glow : 0;
            return (
              <div
                key={`${r.id}-${j}`}
                style={{
                  position: "absolute",
                  left: rowX,
                  top: rowY,
                  width: REASON_W - 24,
                  height: EV_ROW_H,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  opacity: p * (1 - fly * 0.3),
                  translate: `${fx}px ${fy}px`,
                  scale: `${scale}`,
                  transformOrigin: "left center",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 2,
                    backgroundColor: hot > 0 ? colors.accent : colors.rule,
                    opacity: (0.5 + 0.5 * hot) * (1 - evidenceDim * 0.45),
                  }}
                />
                <div
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 23,
                    color: hot > 0 ? colors.accent : evidenceDim > 0.5 ? colors.fgDim : colors.fgSoft,
                    fontWeight: hot > 0.5 ? 600 : 400,
                    whiteSpace: "nowrap",
                  }}
                >
                  {e}
                </div>
              </div>
            );
          }),
        )}

        {/* Rule 2 tags */}
        <div
          style={{
            position: "absolute",
            left: CX + 18,
            top: ANS.y + ANS.h + 8,
            fontFamily: fonts.body,
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "0.1em",
            color: colors.accent,
            opacity: whyIn * tagsOut * tagPulse(whyAt),
            scale: `${0.9 + 0.1 * whyIn}`,
          }}
        >
          WHY?
        </div>
        <div
          style={{
            position: "absolute",
            left: reasonX(1) + REASON_W / 2 + 12,
            top: REASON_Y + REASON_H + 2,
            fontFamily: fonts.body,
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: "0.1em",
            color: colors.accent,
            opacity: howIn * tagsOut * tagPulse(howAt),
            whiteSpace: "nowrap",
          }}
        >
          HOW DO WE KNOW?
        </div>

        {/* Numbered margin */}
        {[margin1, margin2, margin3].map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: MARGIN_X - 30,
              top: [ANS.y + ANS.h / 2 - 30, REASON_Y + REASON_H / 2 - 30, EV_Y + EV_ROW_H * 1.5 - 30][i],
              width: 60,
              height: 60,
              borderRadius: "50%",
              border: `2px solid ${colors.fg}`,
              boxSizing: "border-box",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: fonts.display,
              fontWeight: 600,
              fontSize: 32,
              color: colors.fg,
              backgroundColor: colors.bg,
              opacity: p,
              scale: `${0.7 + 0.3 * p}`,
            }}
          >
            {i + 1}
          </div>
        ))}
        {/* margin rail */}
        <div
          style={{
            position: "absolute",
            left: MARGIN_X - 1,
            top: ANS.y + 10,
            width: 2,
            height: EV_Y + EV_ROW_H * 3 - ANS.y - 20,
            backgroundColor: colors.fgFaint,
            opacity: margin1,
          }}
        />

        {/* MECE letters */}
        {MECE.map((m, i) => {
          const p = meceWordIn[i] ?? 0;
          const w = 150;
          const x = 540 - (w * 4 + 16 * 3) / 2 + i * (w + 16);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: 752,
                width: w,
                textAlign: "center",
                opacity: p,
                translate: `0px ${(1 - p) * 18}px`,
              }}
            >
              <div
                style={{
                  fontFamily: fonts.display,
                  fontWeight: 600,
                  fontSize: 76,
                  lineHeight: 1,
                  color: mecePulse > 0 ? colors.accent : colors.fg,
                  scale: `${1 + 0.06 * mecePulse}`,
                }}
              >
                {m.letter}
              </div>
              <div style={{ fontFamily: fonts.body, fontSize: 21, color: colors.fgSoft, marginTop: 6 }}>{m.word}</div>
            </div>
          );
        })}
      </AbsoluteFill>
    </SceneShell>
  );
};
