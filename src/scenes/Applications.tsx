import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneShell, useNarrationStart } from "../components/SceneShell";
import { enter, sec } from "../components/motion";
import { DECK_TREE_CONFIG, DECK_TREE_FONTS, DECK_TREE_ORIGIN } from "../components/DeckPyramid";
import { layoutPyramid, type LaidOutNode } from "../components/pyramid/layout";
import { PyramidView, type NodeAppearance } from "../components/pyramid/PyramidView";
import { SectionRail } from "../components/SectionRail";
import { ANSWER_TREE, HYPOTHESIS_TEXT, OWNERS, QUESTION_TEXT } from "../example";
import { beatEnd, beatStart, cue } from "../narration";
import { colors, easeInOut, fonts } from "../theme";

const ID = "08-applications";

const WEEKS: Record<string, string> = { cust: "wk 1–3", comp: "wk 1–2", co: "wk 2–4" };

const FONT_SIZES = DECK_TREE_FONTS;

/** Fade helper: 0→1 over `dur` seconds from `startFrame`, ease-in-out. */
const useFade = (frame: number, fps: number) => (startFrame: number, dur: number): number =>
  interpolate(frame, [startFrame, startFrame + sec(dur, fps)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeInOut,
  });

const ModeLabel: React.FC<{ text: string; opacity: number; y: number }> = ({ text, opacity, y }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: y,
      width: 1080,
      textAlign: "center",
      fontFamily: fonts.body,
      fontWeight: 600,
      fontSize: 26,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: colors.accent,
      opacity,
      translate: `0px ${(1 - opacity) * 8}px`,
    }}
  >
    {text}
  </div>
);

/**
 * Mode tag: which direction the same shape is being read in. Set vertically beside the tree, on
 * the side the closing loop will later label, so the tag and the loop label are one element.
 */
const ModeTag: React.FC<{ label: string; side: "left" | "right"; x: number; y: number; opacity: number }> = ({
  label,
  side,
  x,
  y,
  opacity,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      writingMode: "vertical-rl",
      rotate: side === "left" ? "180deg" : "0deg",
      fontFamily: fonts.body,
      fontWeight: 600,
      fontSize: 22,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: colors.accent,
      opacity,
      translate: `0px ${(1 - opacity) * 8}px`,
    }}
  >
    {label}
  </div>
);

/**
 * Slide 3, part four: the same tree read in the other direction. Answers → questions (issue
 * tree) → claims (hypothesis tree) → owners (work plan) → back to answers, with the loop closed.
 */
export const Applications: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t0 = useNarrationStart(ID);
  const at = (s: number): number => t0 + sec(s, fps);
  const b = (i: number): number => at(beatStart(ID, i));
  const fade = useFade(frame, fps);

  const layout = layoutPyramid(ANSWER_TREE, DECK_TREE_CONFIG);
  const origin = DECK_TREE_ORIGIN;

  // The tree is already in place (this scene follows Recursion). Four beats:
  // 0 communicating → thinking · 1 issue tree · 2 hypothesis tree + work plan · 3 the loop closes.
  const b0Len = beatEnd(ID, 0) - beatStart(ID, 0);

  // Mode tags: COMMUNICATING, then THINKING. The first leaves completely before the second arrives.
  const outIn = enter(frame, at(cue(ID, "communicating", beatStart(ID, 0) + 1.4)), sec(0.6, fps));
  const inStart = at(cue(ID, "thinking", beatStart(ID, 0) + b0Len * 0.6));
  const outGone = enter(frame, inStart - sec(0.5, fps), sec(0.35, fps));
  const inIn = enter(frame, inStart, sec(0.5, fps));

  // Text morphs: the old text fades fully out, then the new text fades in (never doubled).
  const morph = (startFrame: number, dur: number): { out: number; in: number } => ({
    out: fade(startFrame, dur / 2),
    in: fade(startFrame + sec(dur / 2, fps), dur / 2),
  });
  // Beat 1: questions.
  const qm = morph(at(cue(ID, "question", beatStart(ID, 1) + 1.2)), 1.0);
  const issueLabel = enter(frame, at(cue(ID, "issue", beatStart(ID, 1) + 2.6)), sec(0.6, fps));
  const calloutIn = enter(frame, at(cue(ID, "single analysis", beatEnd(ID, 1) - 1.6)), sec(0.7, fps));
  // Beat 2: claims, then owners.
  const hm = morph(at(cue(ID, "claims", beatStart(ID, 2) + 1.3)), 1.0);
  const hypoLabel = enter(frame, at(cue(ID, "hypothesis tree", beatStart(ID, 2) + 3.6)), sec(0.6, fps));
  const chipsStart = at(cue(ID, "names", beatStart(ID, 2) + 5.2));
  const chips = (i: number): number => enter(frame, chipsStart + sec(0.2 * i, fps), sec(0.7, fps));
  const planLabel = enter(frame, at(cue(ID, "work plan", beatEnd(ID, 2) - 0.8)), sec(0.6, fps));
  // Beat 3: labels dissolve, back to answers, the loop closes.
  const dissolve = fade(b(3), 0.7);
  const bm = morph(b(3) + sec(0.4, fps), 1.1);
  const back = bm.in;
  const loop = fade(at(cue(ID, "rules", beatStart(ID, 3) + 3.4)), 1.4);
  const loopLabels = enter(frame, at(cue(ID, "name", beatEnd(ID, 3) - 0.4)), sec(0.6, fps));

  const answersOpacity = qm.out < 1 ? 1 - qm.out : back;
  const qOpacity = qm.in * (1 - hm.out);
  const hOpacity = hm.in * (1 - bm.out);
  // The tree lifts 20px on "communicating", settles 20px lower on "thinking", returns at the end.
  const driftY = -20 * outIn * (1 - inIn) + 20 * inIn * (1 - dissolve);
  const labelY = origin.y + layout.height + 58;
  const railIn = enter(frame, at(-0.2), sec(0.6, fps));

  const inkAlpha = `rgba(242, 245, 250, ${answersOpacity.toFixed(3)})`;
  const baseLook = (n: LaidOutNode): NodeAppearance =>
    n.depth === 2 ? { text: "", fill: colors.surfaceDeep } : { color: inkAlpha };
  const textLook =
    (table: Record<string, string>) =>
    (n: LaidOutNode): NodeAppearance =>
      n.depth === 2 ? { text: "", fill: colors.surfaceDeep } : { text: table[n.node.id] ?? n.node.text };

  // Geometry for chips and the callout.
  const reasons = layout.nodes.filter((n) => n.depth === 1);
  const leaves = layout.nodes.filter((n) => n.depth === 2);
  const leafBottom = Math.max(...leaves.map((n) => n.y + n.h)) + origin.y;
  const leafLeft = Math.min(...leaves.map((n) => n.x)) + origin.x;
  const leafRight = Math.max(...leaves.map((n) => n.x + n.w)) + origin.x;

  // Loop rectangle around the tree.
  const LOOP = { x: origin.x - 26, y: origin.y - 24, w: layout.width + 52, h: layout.height + 48, r: 28 };
  const loopPath = `M ${LOOP.x + LOOP.w / 2} ${LOOP.y + LOOP.h} H ${LOOP.x + LOOP.r} A ${LOOP.r} ${LOOP.r} 0 0 1 ${LOOP.x} ${LOOP.y + LOOP.h - LOOP.r} V ${LOOP.y + LOOP.r} A ${LOOP.r} ${LOOP.r} 0 0 1 ${LOOP.x + LOOP.r} ${LOOP.y} H ${LOOP.x + LOOP.w - LOOP.r} A ${LOOP.r} ${LOOP.r} 0 0 1 ${LOOP.x + LOOP.w} ${LOOP.y + LOOP.r} V ${LOOP.y + LOOP.h - LOOP.r} A ${LOOP.r} ${LOOP.r} 0 0 1 ${LOOP.x + LOOP.w - LOOP.r} ${LOOP.y + LOOP.h} Z`;

  return (
    <SceneShell sceneId={ID}>
      <AbsoluteFill>
        <SectionRail current={2} enter={railIn} />

        {/* Mode tags beside the tree; they return as the loop's labels at the end. */}
        <ModeTag
          label="Communicating"
          side="right"
          x={LOOP.x + LOOP.w + 10}
          y={LOOP.y + LOOP.h / 2 - 110}
          opacity={Math.max(outIn * (1 - outGone) * (1 - dissolve), loopLabels)}
        />
        <ModeTag
          label="Thinking"
          side="left"
          x={LOOP.x - 40}
          y={LOOP.y + LOOP.h / 2 - 110}
          opacity={Math.max(inIn * (1 - dissolve), loopLabels)}
        />

        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1080, translate: `0px ${driftY}px` }}>
        {/* Base tree (answers). */}
        <PyramidView layout={layout} origin={origin} fontSize={FONT_SIZES} appearance={baseLook} />

        {/* Question overlay. */}
        {qOpacity > 0 ? (
          <div style={{ opacity: qOpacity }}>
            <PyramidView layout={layout} origin={origin} fontSize={FONT_SIZES} edges={false} appearance={textLook(QUESTION_TEXT)} />
          </div>
        ) : null}

        {/* Hypothesis overlay. */}
        {hOpacity > 0 ? (
          <div style={{ opacity: hOpacity }}>
            <PyramidView layout={layout} origin={origin} fontSize={FONT_SIZES} edges={false} appearance={textLook(HYPOTHESIS_TEXT)} />
          </div>
        ) : null}

        {/* "one analysis" callout: a bracket under the leaves. */}
        {calloutIn > 0 ? (
          <div style={{ opacity: calloutIn * (1 - hm.in) * (1 - dissolve) }}>
            <svg style={{ position: "absolute", left: 0, top: 0 }} width={1080} height={1080}>
              <path
                d={`M ${leafLeft} ${leafBottom + 10} v 10 H ${leafRight} v -10`}
                fill="none"
                stroke={colors.accent}
                strokeWidth={2}
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - calloutIn}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: leafBottom + 30,
                width: 1080,
                textAlign: "center",
                fontFamily: fonts.body,
                fontSize: 22,
                color: colors.accent,
              }}
            >
              each piece: one analysis
            </div>
          </div>
        ) : null}

        {/* Owner chips + week markers on the three branches. */}
        {reasons.map((n, i) => {
          const c = chips(i) * (1 - dissolve);
          if (c <= 0) return null;
          const cx = origin.x + n.x + n.w - 8;
          const cy = origin.y + n.y - 8;
          return (
            <React.Fragment key={n.node.id}>
              <div
                style={{
                  position: "absolute",
                  left: cx - 24,
                  top: cy - 24,
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: colors.accent,
                  color: colors.paper,
                  fontFamily: fonts.body,
                  fontWeight: 600,
                  fontSize: 22,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: c,
                  scale: `${0.7 + 0.3 * c}`,
                }}
              >
                {OWNERS[n.node.id] ?? "—"}
              </div>
              <div
                style={{
                  position: "absolute",
                  left: origin.x + n.x + n.w / 2 - 50,
                  top: origin.y + n.y + n.h + 8,
                  width: 100,
                  textAlign: "center",
                  fontFamily: fonts.body,
                  fontSize: 22,
                  color: colors.fgSoft,
                  backgroundColor: colors.bg,
                  opacity: c,
                }}
              >
                {WEEKS[n.node.id] ?? ""}
              </div>
            </React.Fragment>
          );
        })}

        {/* Mode labels, one at a time, beneath the tree. */}
        <ModeLabel text="Issue tree" y={labelY} opacity={issueLabel * (1 - hm.in) * (1 - dissolve)} />
        <ModeLabel text="Hypothesis tree" y={labelY} opacity={hypoLabel * (1 - planLabel) * (1 - dissolve)} />
        <ModeLabel text="Work plan" y={labelY} opacity={planLabel * (1 - dissolve)} />

        {/* The loop: communicating up the right side, thinking down the left. */}
        {loop > 0 ? (
          <>
            <svg style={{ position: "absolute", left: 0, top: 0 }} width={1080} height={1080}>
              <path
                d={loopPath}
                fill="none"
                stroke={colors.accent}
                strokeWidth={2.5}
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - loop}
                strokeLinecap="round"
              />
              {/* arrowheads: right side pointing up, left side pointing down */}
              <path
                d={`M ${LOOP.x + LOOP.w - 11} ${LOOP.y + LOOP.h / 2 + 10} L ${LOOP.x + LOOP.w} ${LOOP.y + LOOP.h / 2 - 4} L ${LOOP.x + LOOP.w + 11} ${LOOP.y + LOOP.h / 2 + 10}`}
                fill="none"
                stroke={colors.accent}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={loop > 0.55 ? 1 : 0}
              />
              <path
                d={`M ${LOOP.x - 11} ${LOOP.y + LOOP.h / 2 - 10} L ${LOOP.x} ${LOOP.y + LOOP.h / 2 + 4} L ${LOOP.x + 11} ${LOOP.y + LOOP.h / 2 - 10}`}
                fill="none"
                stroke={colors.accent}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={loop > 0.95 ? 1 : 0}
              />
            </svg>
          </>
        ) : null}
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
