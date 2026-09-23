import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneShell, useNarrationStart } from "../components/SceneShell";
import { enter, sec } from "../components/motion";
import { EmailGlyph, IssueTreeGlyph, PromptGlyph } from "../components/NextStepsGlyphs";
import { SectionRail } from "../components/SectionRail";
import { beatEnd, beatStart } from "../narration";
import { colors, fonts, layout } from "../theme";

const ID = "11-next-steps";

const PROMPT = "How would Barbara Minto structure this?";

const ROWS = [
  { n: "1", label: "Your next email", y: 232 },
  { n: "2", label: "Your next big problem", y: 428 },
  { n: "3", label: "Your next AI prompt", y: 612 },
] as const;

/** 0..1 progress through beat `i`, between fractions `a` and `b` of its spoken length. */
const useBeatSpan = (frame: number, fps: number, t0: number, i: number, a: number, b: number, fallbackStart: number): number => {
  const s = beatStart(ID, i, fallbackStart);
  const e = beatEnd(ID, i, fallbackStart + 2.5);
  const from = t0 + sec(s + (e - s) * a, fps);
  const to = t0 + sec(s + (e - s) * b, fps);
  return interpolate(frame, [from, Math.max(from + 1, to)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
};

/**
 * Next steps: three things the viewer can do, each drawn as a glyph on its beat. Beat 0 sets up the
 * frame; beats 1–3 are the email, the MECE split, and the AI prompt typed in. After the narration
 * ends, the author's one on-screen line fades in and holds.
 */
export const NextSteps: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t0 = useNarrationStart(ID);
  const at = (seconds: number): number => t0 + sec(seconds, fps);

  const railIn = enter(frame, 0, sec(0.8, fps));
  const rowIn = [
    enter(frame, at(beatStart(ID, 1, 1.6)), sec(0.6, fps)),
    enter(frame, at(beatStart(ID, 2, 4.7)), sec(0.6, fps)),
    enter(frame, at(beatStart(ID, 3, 7.3)), sec(0.6, fps)),
  ] as const;
  // Beat 1: the first line lights about a third of the way through ("first line").
  const firstLineIn = useBeatSpan(frame, fps, t0, 1, 0.35, 0.6, 1.6);
  // Beat 2: the box splits across the middle of the beat ("break it into MECE sub-problems").
  const split = useBeatSpan(frame, fps, t0, 2, 0.25, 0.7, 4.7);
  const meceIn = useBeatSpan(frame, fps, t0, 2, 0.6, 0.8, 4.7);
  // Beat 3: the prompt types in over the second half of the beat ("just ask: ...").
  const typed = useBeatSpan(frame, fps, t0, 3, 0.45, 0.98, 7.3);
  // Author line: after the last beat has ended and its caption has cleared.

  const glyphX = 230;
  const labelX = 640;

  return (
    <SceneShell sceneId={ID}>
      <AbsoluteFill>
        <SectionRail current={4} enter={railIn} />

        {ROWS.map((row, i) => {
          const p = rowIn[i] ?? 0;
          const isPrompt = i === 2;
          return (
            <React.Fragment key={row.n}>
              <div
                style={{
                  position: "absolute",
                  left: layout.margin,
                  top: row.y + 40,
                  fontFamily: fonts.display,
                  fontWeight: 600,
                  fontSize: 84,
                  lineHeight: 1,
                  color: colors.accent,
                  opacity: Math.max(0.12 * railIn, p),
                  translate: `0px ${(1 - p) * 14}px`,
                }}
              >
                {row.n}
              </div>
              <div
                style={{
                  position: "absolute",
                  left: isPrompt ? glyphX : labelX,
                  top: isPrompt ? row.y + 6 : row.y + 64,
                  width: 352,
                  fontFamily: fonts.display,
                  fontWeight: 400,
                  fontSize: 34,
                  lineHeight: 1.2,
                  color: colors.fg,
                  opacity: p,
                  translate: `0px ${(1 - p) * 14}px`,
                  whiteSpace: "nowrap",
                }}
              >
                {row.label}
              </div>
            </React.Fragment>
          );
        })}

        <EmailGlyph x={glyphX} y={ROWS[0].y} enter={rowIn[0]} firstLine={firstLineIn} />
        <IssueTreeGlyph x={glyphX} y={ROWS[1].y} enter={rowIn[1]} split={split} label={meceIn} />
        <PromptGlyph
          x={glyphX}
          y={ROWS[2].y + 66}
          width={1080 - layout.margin - glyphX}
          enter={rowIn[2]}
          typed={typed}
          frame={frame}
          text={PROMPT}
        />

        {/* [CHECK] Author line — the user must approve or rewrite this wording before release. */}
      </AbsoluteFill>
    </SceneShell>
  );
};
