import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { Arcs } from "../components/Arcs";
import { PyramidMark } from "../components/ThesisMark";
import { enter, sec } from "../components/motion";
import { colors, fonts, layout } from "../theme";

const ID = "12-credits";

/** One screen. Minto gets the last word; the maker's line sits small at the bottom. */
export const Credits: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const arcsDraw = enter(frame, 0, sec(1.8, fps));
  const markIn = enter(frame, 0, sec(0.8, fps));
  const titleIn = enter(frame, sec(0.1, fps), sec(0.7, fps));
  const quoteIn = enter(frame, sec(0.9, fps), sec(0.9, fps));
  const sourcesIn = enter(frame, sec(1.6, fps), sec(0.6, fps));
  const madeIn = enter(frame, sec(2.0, fps), sec(0.6, fps));

  return (
    <SceneShell sceneId={ID} tone="deep">
      <AbsoluteFill style={{ alignItems: "center" }}>
        <Arcs width={1080} height={1080} draw={arcsDraw} drift={-frame * 0.12} corner="bottom-right" opacity={0.4} />
        <div style={{ position: "absolute", top: 150 }}>
          <PyramidMark width={72} enter={markIn} />
        </div>
        <div
          style={{
            position: "absolute",
            top: 220,
            fontFamily: fonts.display,
            fontWeight: 600,
            fontSize: 72,
            color: colors.fg,
            opacity: titleIn,
          }}
        >
          Answer First
        </div>
        <div
          style={{
            position: "absolute",
            top: 400,
            width: 820,
            textAlign: "center",
            fontFamily: fonts.displayItalic,
            fontStyle: "italic",
            fontSize: 46,
            lineHeight: 1.3,
            color: colors.fg,
            opacity: quoteIn,
            translate: `0px ${(1 - quoteIn) * 12}px`,
          }}
        >
          “The pyramid is a tool to help you find out what you think.”
        </div>
        <div
          style={{
            position: "absolute",
            top: 560,
            fontFamily: fonts.body,
            fontSize: 22,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: colors.fgSoft,
            opacity: quoteIn,
          }}
        >
          — Barbara Minto
        </div>
        <div
          style={{
            position: "absolute",
            top: 660,
            width: 1080 - layout.margin * 2,
            textAlign: "center",
            fontFamily: fonts.body,
            fontSize: 22,
            lineHeight: 1.4,
            color: colors.fgSoft,
            opacity: sourcesIn,
          }}
        >
          Read the book: <span style={{ color: colors.fg }}>The Pyramid Principle — Barbara Minto</span>
          <br />
          Sources: barbaraminto.com · McKinsey Alumni News, “MECE: I invented it, so I get to say how to pronounce it” · HBS Class of 1963, “If I Knew Then” · Wikipedia
        </div>
        <div
          style={{
            position: "absolute",
            top: 770,
            width: 1080 - layout.margin * 2,
            textAlign: "center",
            fontFamily: fonts.body,
            fontSize: 20,
            color: colors.fgDim,
            opacity: madeIn,
          }}
        >
          Made with Claude Fable 5.1 by Ryan Smith · linkedin.com/in/ryanjsmithphd/
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
