import React, { useMemo } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { createTikTokStyleCaptions, type TikTokPage } from "@remotion/captions";
import { toCaptions } from "../narration";
import { colors, layout, type } from "../theme";

/** How long one caption page stays up. Longer pages read as subtitles, not karaoke. */
const PAGE_MS = 3200;
/** Narrower than the content area so a caption never runs to three lines. */
const MAX_WIDTH = 820;

/**
 * One caption page: plain ink type on the paper, no box. A hairline above the text marks it as
 * part of the page rather than a UI overlay. Spoken words are full ink; unspoken are softened.
 */
const Page: React.FC<{ page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowMs = page.startMs + (frame / fps) * 1000;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          marginBottom: layout.captionBottom - 8,
          maxWidth: MAX_WIDTH,
        }}
      >
        <div style={{ width: 56, height: 1, backgroundColor: colors.rule }} />
        <div
          style={{
            ...type.caption,
            fontSize: 34,
            color: colors.ink,
            whiteSpace: "pre-wrap",
            textAlign: "center",
          }}
        >
          {page.tokens.map((token, i) => {
            const spoken = token.fromMs <= nowMs;
            return (
              <span key={`${token.fromMs}-${i}`} style={{ color: spoken ? colors.ink : colors.inkSoft, opacity: spoken ? 1 : 0.7 }}>
                {token.text}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * Burned-in captions for one scene, derived from that scene's narration timings.
 * `offsetMs` is the scene's leading silence so captions line up with the audio Sequence.
 */
export const Captions: React.FC<{ sceneId: string; offsetMs: number }> = ({ sceneId, offsetMs }) => {
  const { fps } = useVideoConfig();
  const { pages } = useMemo(() => {
    const captions = toCaptions(sceneId, offsetMs);
    return createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: PAGE_MS });
  }, [sceneId, offsetMs]);

  return (
    <AbsoluteFill>
      {pages.map((page, i) => {
        const next = pages[i + 1];
        const start = Math.round((page.startMs / 1000) * fps);
        const lastToken = page.tokens[page.tokens.length - 1];
        const naturalEnd = Math.round(((lastToken?.toMs ?? page.startMs) / 1000) * fps) + Math.round(fps * 0.6);
        const end = next ? Math.min(Math.round((next.startMs / 1000) * fps), naturalEnd) : naturalEnd;
        const duration = end - start;
        if (duration <= 0) return null;
        return (
          <Sequence key={i} from={start} durationInFrames={duration} layout="none">
            <Page page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
