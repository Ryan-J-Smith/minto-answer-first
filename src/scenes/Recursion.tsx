import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SceneShell, useNarrationStart } from "../components/SceneShell";
import { enter, sec } from "../components/motion";
import { SlideCard } from "../components/SlideCard";
import { SectionRail } from "../components/SectionRail";
import { findNode, frameNode, layoutPyramid, subtreeIds } from "../components/pyramid/layout";
import { PyramidView } from "../components/pyramid/PyramidView";
import { ANSWER_TREE, FACT_ROWS } from "../example";
import { beatStart, beatEnd, cue, cueEnd } from "../narration";
import { colors, easeInOut, fonts, layout as L } from "../theme";
import type { PyramidNode } from "../components/pyramid/layout";

const ID = "06-recursion";
const VIEW = { width: 1080, height: 1080, padding: 150 };

/** Short evidence labels for the zoomed-out view; full claims take over as the camera pushes in. */
const SHORT: Record<string, string> = {
  "cust-1": "94% renewed",
  "cust-2": "4.6 / 5 value",
  "cust-3": "1 segment at risk",
  "comp-1": "2 of 3 raised",
  "comp-2": "now lowest",
  "comp-3": "0 share lost",
  "co-1": "costs +11%",
  "co-2": "2 qtrs missed",
  "co-3": "8% closes gap",
};

const MAIN_CFG = { boxW: [600, 280, 90], boxH: [124, 108, 84], gapX: [0, 28, 8], gapY: [0, 90, 80] };
const FACT_CFG = { boxW: [90, 110], boxH: [84, 70], gapX: [0, 10], gapY: [0, 60] };

const lerpCam = (
  a: { scale: number; tx: number; ty: number },
  b: { scale: number; tx: number; ty: number },
  p: number,
): { scale: number; tx: number; ty: number } => ({
  scale: a.scale + (b.scale - a.scale) * p,
  tx: a.tx + (b.tx - a.tx) * p,
  ty: a.ty + (b.ty - a.ty) * p,
});

/**
 * The signature scene: the same shape at every level. Camera pushes into a reason, then into a
 * piece of evidence, finds facts at the bottom, pulls out, and shows the tree at three sizes.
 */
export const Recursion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t0 = useNarrationStart(ID);
  const at = (s: number): number => t0 + sec(s, fps);
  const ease = (from: number, to: number): number =>
    interpolate(frame, [at(from), at(to)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });

  const main = layoutPyramid(ANSWER_TREE, MAIN_CFG);
  const origin = { x: (1080 - main.width) / 2, y: 236 };
  const cust = main.byId["cust"];
  const cust1 = main.byId["cust-1"];

  // Fact sub-tree hangs under cust-1, positioned so its root coincides with cust-1's box.
  const facts = layoutPyramid(FACT_ROWS, FACT_CFG);
  const factsRoot = facts.byId["cust-1"];
  const factsOrigin = {
    x: origin.x + (cust1?.x ?? 0) - (factsRoot?.x ?? 0),
    y: origin.y + (cust1?.y ?? 0),
  };

  // Cameras (in main-layout space; the facts view gets the same camera, adjusted for its origin).
  const camFull = { scale: 1, tx: 0, ty: 0 };
  const camCust = frameNode(main, "cust", VIEW, origin, findNode(ANSWER_TREE, "cust"));
  // Frame cust-1 plus the fact rows: bounding box in main space.
  const camFacts = (() => {
    const ids = subtreeIds(FACT_ROWS);
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const id of ids) {
      const n = facts.byId[id];
      if (!n) continue;
      const x = factsOrigin.x + n.x - origin.x; // to main-layout space
      const y = factsOrigin.y + n.y - origin.y;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + n.w);
      maxY = Math.max(maxY, y + n.h);
    }
    const bw = maxX - minX;
    const bh = maxY - minY;
    const scale = Math.min((VIEW.width - VIEW.padding * 2) / bw, (VIEW.height - 2 * VIEW.padding) / bh);
    const cx = minX + bw / 2;
    const cy = minY + bh / 2;
    return { scale, tx: VIEW.width / 2 - origin.x - cx * scale, ty: VIEW.height / 2 - 40 - origin.y - cy * scale };
  })();

  // Beat timings
  // Beats (script v6): 0 every box · 1 push / push again · 2 stop at a fact · 3 any size.
  const b1 = cue(ID, "every box", beatStart(ID, 0) + 1.9);
  const b2 = cue(ID, "Push into", beatStart(ID, 1, 4.9));
  const b3 = cue(ID, "Push again", beatStart(ID, 1, 4.9) + 5.7);
  const b4 = beatStart(ID, 2, 13.1);
  const b5 = beatStart(ID, 3, 17.4);
  const sentenceAt = cue(ID, "single sentence", b5 + 3.8);
  const yearAt = cue(ID, "year-long", b5 + 5.0);
  const end = beatEnd(ID, 3, 23.5);
  const cueEndOf = (phrase: string, fallback: number): number => cueEnd(ID, phrase, fallback);

  // Camera choreography
  const push1 = ease(b2 + 0.15, b2 + 1.5);
  const push2 = ease(b3 + 0.1, b3 + 1.4);
  const pullOut = ease(b5 - 0.2, b5 + 1.3);
  // Three sizes: shrink into a sentence, grow into a slide, grow past the frame.
  // Sequenced, not crossfaded: each size fully leaves before the next enters.
  // v6 names only two sizes (a sentence, a year-long problem); the slide stage is retired.
  const toSentence = ease(sentenceAt, sentenceAt + 0.35);
  const sentenceOut = ease(yearAt - 0.35, yearAt - 0.05);
  const toSlide = 0;
  const slideOut = 0;
  const toYear = ease(yearAt, yearAt + 0.9);

  let camera = lerpCam(camFull, camCust, push1);
  camera = lerpCam(camera, camFacts, push2);
  camera = lerpCam(camera, camFull, pullOut);
  // Size play: scale about the frame centre.
  const cxMain = origin.x + main.width / 2;
  const cyMain = origin.y + main.height / 2;
  const sizeScale = (() => {
    const s1 = 1 + (0.13 - 1) * toSentence;
    const s2 = s1 + (0.36 - s1) * toSlide;
    // Cap so the root box stays partly visible at the top of the frame.
    return s2 + (1.75 - s2) * toYear;
  })();
  const sizeCam = (() => {
    const s = sizeScale;
    // keep the tree centred on the frame centre (540, 540) as it scales
    const targetCx = 540;
    const targetCy = 520 + 60 * toYear;
    return { scale: s, tx: targetCx - origin.x - (cxMain - origin.x) * s, ty: targetCy - origin.y - (cyMain - origin.y) * s };
  })();
  const sizing = Math.max(toSentence, toSlide, toYear);
  camera = lerpCam(camera, sizeCam, sizing > 0 ? 1 : 0);

  // Text crossfade: short labels at low zoom, full claims when pushed in.
  const zoomT = interpolate(camera.scale, [1.3, 2.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const custEmph = interpolate(frame, [at(b1 + 0.1), at(b1 + 0.6), at(b2 + 1.2), at(b2 + 1.6)], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cust1Emph = interpolate(frame, [at(b3 - 0.1), at(b3 + 0.3), at(b3 + 1.2), at(b3 + 1.6)], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const custIds = new Set(subtreeIds(findNode(ANSWER_TREE, "cust") as PyramidNode));
  const dimOthers = push1 * (1 - pullOut);
  const factsIn = enter(frame, at(b3 + 0.5), sec(0.7, fps));
  const factsMono = enter(frame, at(b4 + 0.2), sec(0.6, fps));
  const tickAt = cue(ID, "point to", b4 + 2.4);
  const tickIn = enter(frame, at(tickAt), sec(0.5, fps));
  const factsOut = 1 - pullOut;

  const treeIn = enter(frame, at(0.1), sec(0.9, fps));
  // Overlays fade in only once the tree has mostly reached its new size, so they never sit on top of a large tree.
  const late = (p: number): number => interpolate(p, [0.55, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sentenceIn = late(toSentence) * (1 - sentenceOut);
  const slideIn = late(toSlide) * (1 - slideOut);
  // The quote gets its own beat: in as "problem" is spoken, held to the end of the scene over a paper wash.
  const quoteAt = cueEndOf("problem", yearAt + 0.9) + 0.15;
  const quoteIn = enter(frame, at(quoteAt), sec(0.6, fps));
  const wash = interpolate(quoteIn, [0, 1], [0, 0.85], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const eyebrowOut = 1 - Math.max(push1 * (1 - pullOut), sizing);

  // As the tree grows past the frame it recedes, so the closing quote reads on top of it.
  // Fade the big tree to ≤ 8% (dim 1.15 → opacity ≈ 0.08).
  const yearFade = interpolate(toYear, [0.2, 0.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const appearance = (n: { node: PyramidNode; depth: number }) => {
    const id = n.node.id;
    const isCustTree = custIds.has(id);
    const short = SHORT[id];
    const text = n.depth === 2 && short ? (zoomT < 0.5 ? short : n.node.text) : undefined;
    const focusDim = isCustTree ? (id === "cust" || id === "cust-1" ? 0 : push2 * factsOut * 0.7) : dimOthers;
    return {
      enter: treeIn,
      text,
      emphasis: id === "cust" ? custEmph : id === "cust-1" ? cust1Emph : 0,
      dim: Math.max(focusDim, yearFade * 1.15),
    };
  };

  return (
    <SceneShell sceneId={ID}>
      <AbsoluteFill>
        {/* SectionRail treats `enter` as draw progress, so fade it out with a wrapper during push-ins. */}
        <div style={{ opacity: eyebrowOut }}>
          <SectionRail current={2} enter={treeIn} />
        </div>

        {/* Slide frame for "a slide" */}
        <div style={{ position: "absolute", left: 540 - 300, top: 520 - 168, opacity: slideIn }}>
          <SlideCard width={600} title="" bullets={[]} style={{ backgroundColor: "transparent" }} />
        </div>
        {/* Sentence line for "a sentence" */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 498,
            width: 450,
            textAlign: "right",
            fontFamily: fonts.display,
            fontSize: 40,
            color: colors.fg,
            opacity: sentenceIn,
            whiteSpace: "nowrap",
          }}
        >
          We should raise the price,
        </div>
        <div
          style={{
            position: "absolute",
            left: 630,
            top: 498,
            fontFamily: fonts.display,
            fontSize: 40,
            color: colors.fg,
            opacity: sentenceIn,
            whiteSpace: "nowrap",
          }}
        >
          for three reasons.
        </div>

        <PyramidView
          layout={main}
          origin={origin}
          camera={camera}
          fontSize={[33, 26, 11.5]}
          appearance={appearance}
          stroke={2}
        />
        {/* Fact rows under cust-1, same camera */}
        {factsIn > 0 && factsOut > 0 ? (
          <PyramidView
            layout={facts}
            origin={factsOrigin}
            camera={{
              scale: camera.scale,
              tx: camera.tx + (origin.x - factsOrigin.x) * (1 - camera.scale) + 0,
              ty: camera.ty + (origin.y - factsOrigin.y) * (1 - camera.scale) + 0,
            }}
            fontSize={[11.5, 9]}
            edges
            appearance={(n) =>
              n.depth === 0
                ? { enter: 0 }
                : { enter: factsIn * factsOut, mono: factsMono > 0.5, fill: factsMono > 0.5 ? colors.surfaceDeep : undefined }
            }
          />
        ) : null}

        {/* "a fact" tick, in screen space near the bottom row */}
        <div
          style={{
            position: "absolute",
            left: 540 - 120,
            top: 760,
            width: 240,
            textAlign: "center",
            fontFamily: fonts.body,
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: "0.08em",
            color: colors.accent,
            opacity: tickIn * factsOut,
            translate: `0px ${(1 - tickIn) * 10}px`,
          }}
        >
          ✓ A FACT
        </div>

        {/* Size labels */}
        {[
          { label: "a sentence", p: sentenceIn },
          { label: "a slide", p: slideIn },
          { label: "a year-long problem", p: late(toYear) * (1 - quoteIn) },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              position: "absolute",
              left: L.margin,
              top: 780,
              fontFamily: fonts.body,
              fontSize: 26,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: colors.fgSoft,
              opacity: s.p,
            }}
          >
            {s.label}
          </div>
        ))}

        {/* Paper wash under the closing quote */}
        <AbsoluteFill style={{ backgroundColor: colors.bg, opacity: wash }} />
        {/* Closing quote */}
        <div
          style={{
            position: "absolute",
            left: 0,
            width: 1080,
            textAlign: "center",
            fontFamily: fonts.displayItalic,
            fontStyle: "italic",
            fontSize: 42,
            lineHeight: 1.25,
            color: colors.fg,
            opacity: quoteIn,
            padding: "0 100px",
            boxSizing: "border-box",
            top: 430,
            translate: `0px ${(1 - quoteIn) * 12}px`,
          }}
        >
          “The pyramid is a tool to help you find out what you think.”
          <div style={{ fontFamily: fonts.body, fontStyle: "normal", fontSize: 22, letterSpacing: "0.16em", color: colors.fgSoft, marginTop: 22 }}>
            — BARBARA MINTO
          </div>
        </div>
      </AbsoluteFill>
    </SceneShell>
  );
};
