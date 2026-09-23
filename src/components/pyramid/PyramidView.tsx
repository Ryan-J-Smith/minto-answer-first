import React from "react";
import { colors, fonts } from "../../theme";
import type { LaidOutNode, PyramidLayout } from "./layout";

export type NodeAppearance = {
  /** 0..1 entrance progress. 0 = hidden. */
  enter?: number;
  /** Override the displayed text (e.g. question form). */
  text?: string;
  sub?: string;
  /** Accent outline / emphasis 0..1. */
  emphasis?: number;
  /** Dim to background 0..1 (1 = fully dimmed). */
  dim?: number;
  /** Extra translate in px, e.g. for overlap/gap demonstrations. */
  dx?: number;
  dy?: number;
  /** Fill colour override. */
  fill?: string;
  /** Text colour override. */
  color?: string;
  /** Monospace "fact" styling. */
  mono?: boolean;
};

export type PyramidViewProps = {
  layout: PyramidLayout;
  /** Where the layout's (0,0) sits in the parent, in px. */
  origin: { x: number; y: number };
  /** Camera transform applied around the origin. */
  camera?: { scale: number; tx: number; ty: number };
  /** Per-node appearance. Nodes without an entry use `defaultAppearance`. */
  appearance?: (node: LaidOutNode) => NodeAppearance;
  /** Font size per depth. */
  fontSize?: number[];
  /** Serif for depth 0 by default; set false for all-sans. */
  serifRoot?: boolean;
  /** Hairline stroke width. */
  stroke?: number;
  /** Render edges (connectors). */
  edges?: boolean;
  /** Border radius. */
  radius?: number;
};

const pickN = (arr: number[] | undefined, i: number, fallback: number): number =>
  arr ? (arr[Math.min(i, arr.length - 1)] ?? fallback) : fallback;

/**
 * Renders a laid-out pyramid: hairline boxes on paper with elbow connectors.
 * Everything is absolutely positioned so a camera transform can push into any node.
 */
export const PyramidView: React.FC<PyramidViewProps> = ({
  layout,
  origin,
  camera = { scale: 1, tx: 0, ty: 0 },
  appearance,
  fontSize,
  serifRoot = true,
  stroke = 2,
  edges = true,
  radius = 4,
}) => {
  const look = (n: LaidOutNode): NodeAppearance => appearance?.(n) ?? {};

  return (
    <div
      style={{
        position: "absolute",
        left: origin.x,
        top: origin.y,
        width: layout.width,
        height: layout.height,
        transformOrigin: "0 0",
        transform: `translate(${camera.tx}px, ${camera.ty}px) scale(${camera.scale})`,
      }}
    >
      {edges ? (
        <svg
          style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
          width={layout.width}
          height={layout.height}
        >
          {layout.edges.map((e) => {
            const child = layout.byId[e.to];
            if (!child) return null;
            const a = look(child);
            const enter = a.enter ?? 1;
            if (enter <= 0) return null;
            const dim = a.dim ?? 0;
            return (
              <path
                key={`${e.from}-${e.to}`}
                d={e.path}
                fill="none"
                stroke={colors.rule}
                strokeWidth={stroke}
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - enter}
                opacity={1 - dim * 0.85}
                style={{ translate: `${a.dx ?? 0}px ${a.dy ?? 0}px` }}
              />
            );
          })}
        </svg>
      ) : null}
      {layout.nodes.map((n) => {
        const a = look(n);
        const enter = a.enter ?? 1;
        if (enter <= 0) return null;
        const emphasis = a.emphasis ?? 0;
        const dim = a.dim ?? 0;
        const isRoot = n.depth === 0 && serifRoot;
        const fs = pickN(fontSize, n.depth, n.depth === 0 ? 34 : n.depth === 1 ? 24 : 18);
        const border = emphasis > 0 ? colors.accent : colors.ink;
        return (
          <div
            key={n.node.id}
            style={{
              position: "absolute",
              left: n.x,
              top: n.y,
              width: n.w,
              height: n.h,
              boxSizing: "border-box",
              border: `${stroke + emphasis}px solid ${border}`,
              borderRadius: radius,
              backgroundColor: a.fill ?? colors.paper,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: `0 ${Math.round(fs * 0.5)}px`,
              gap: Math.round(fs * 0.2),
              opacity: enter * (1 - dim * 0.8),
              translate: `${a.dx ?? 0}px ${(a.dy ?? 0) + (1 - enter) * 12}px`,
              boxShadow: emphasis > 0 ? `0 0 0 ${6 * emphasis}px rgba(61,188,242,${0.18 * emphasis})` : undefined,
            }}
          >
            <div
              style={{
                fontFamily: a.mono ? "ui-monospace, Menlo, monospace" : isRoot ? fonts.display : fonts.body,
                fontWeight: isRoot ? 600 : a.mono ? 400 : 600,
                fontSize: fs,
                lineHeight: 1.15,
                color: a.color ?? colors.ink,
              }}
            >
              {a.text ?? n.node.text}
            </div>
            {(a.sub ?? n.node.sub) ? (
              <div
                style={{
                  fontFamily: fonts.body,
                  fontSize: Math.round(fs * 0.72),
                  lineHeight: 1.2,
                  color: colors.inkSoft,
                }}
              >
                {a.sub ?? n.node.sub}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
