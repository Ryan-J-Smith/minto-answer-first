import React from "react";
import { layoutPyramid } from "./pyramid/layout";
import { PyramidView } from "./pyramid/PyramidView";
import { ANSWER_TREE } from "../example";
import { colors, fonts } from "../theme";

/** Where the page sits in the 1080 frame. Shared by Hook (assembly) and Title (dimmed backdrop). */
export const PAGE = { x: 110, y: 160, w: 860, h: 620 } as const;

/** Root and reason box sizes are exported so the Hook's rising line can land on the root exactly. */
export const PAGE_ROOT = { w: 760, h: 130 } as const;
export const PAGE_ORIGIN_DY = 84;

const PYRAMID_CFG = {
  boxW: [PAGE_ROOT.w, 244],
  boxH: [PAGE_ROOT.h, 110],
  gapX: [0, 20],
  gapY: [0, 56],
};

/** Answer + reasons only; evidence is drawn as dashes, so the tree is pruned before layout
 * (maxDepth alone would still reserve width for the grandchildren). */
const PAGE_TREE = {
  ...ANSWER_TREE,
  children: (ANSWER_TREE.children ?? []).map((c) => ({ id: c.id, text: c.text })),
};

export const hookPageLayout = () => layoutPyramid(PAGE_TREE, PYRAMID_CFG);

/** Evidence "dashes": three grey rows under each reason box, widths vary so they read as lines of text. */
const DASH_WIDTHS: number[][] = [
  [0.9, 0.7, 0.8],
  [0.85, 0.6, 0.75],
  [0.7, 0.9, 0.55],
];

/**
 * The one-page pyramid promised by the hook: answer box, three reasons, nine evidence lines, and a
 * page outline. All entrances are 0..1 so the Hook can assemble it and the Title can hold it.
 */
export const HookPage: React.FC<{
  rootIn: number;
  reasonsIn: [number, number, number];
  dashesIn: number;
  outlineIn: number;
  opacity?: number;
  /** Uniform scale about the page's top-centre, so the Hook can shrink it up to make room below. */
  scale?: number;
}> = ({ rootIn, reasonsIn, dashesIn, outlineIn, opacity = 1, scale = 1 }) => {
  const layout = hookPageLayout();
  const origin = { x: PAGE.x + (PAGE.w - layout.width) / 2, y: PAGE.y + PAGE_ORIGIN_DY };
  const reasons = layout.nodes.filter((n) => n.depth === 1);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1080,
        height: 1080,
        opacity,
        scale: `${scale}`,
        transformOrigin: `${PAGE.x + PAGE.w / 2}px ${PAGE.y}px`,
      }}
    >
      <svg style={{ position: "absolute", left: 0, top: 0 }} width={1080} height={1080}>
        <rect
          x={PAGE.x}
          y={PAGE.y}
          width={PAGE.w}
          height={PAGE.h}
          fill="none"
          stroke={colors.ink}
          strokeWidth={2}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - outlineIn}
          opacity={outlineIn > 0 ? 1 : 0}
        />
      </svg>
      <PyramidView
        layout={layout}
        origin={origin}
        fontSize={[34, 25]}
        appearance={(n) => {
          if (n.depth === 0) return { enter: rootIn };
          const i = reasons.findIndex((r) => r.node.id === n.node.id);
          return { enter: reasonsIn[i] ?? 0 };
        }}
      />
      {reasons.map((r, ri) => {
        const rows = DASH_WIDTHS[ri] ?? [0.8, 0.7, 0.6];
        return rows.map((w, di) => {
          // Nine dashes assemble in reading order across the three columns.
          const k = di * 3 + ri;
          const p = Math.max(0, Math.min(1, dashesIn * 9 - k));
          return (
            <div
              key={`${ri}-${di}`}
              style={{
                position: "absolute",
                left: origin.x + r.x + 16,
                top: origin.y + r.y + r.h + 30 + di * 30,
                width: (r.w - 32) * w * p,
                height: 12,
                borderRadius: 4,
                backgroundColor: colors.inkFaint,
              }}
            />
          );
        });
      })}
      <div
        style={{
          position: "absolute",
          left: PAGE.x + 32,
          top: PAGE.y + 28,
          fontFamily: fonts.body,
          fontSize: 20,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: colors.inkSoft,
          opacity: outlineIn,
        }}
      >
        One page
      </div>
    </div>
  );
};
