/**
 * Tree layout for pyramids. Pure functions, no React, so scenes can do camera math
 * (push into a node, pull out) from the same numbers the renderer uses.
 */

export type PyramidNode = {
  id: string;
  text: string;
  /** Optional smaller line under the text. */
  sub?: string;
  children?: PyramidNode[];
};

export type LayoutConfig = {
  /** Box width per depth (index = depth). Last value repeats for deeper levels. */
  boxW: number[];
  /** Box height per depth. */
  boxH: number[];
  /** Horizontal gap between sibling boxes per depth of the *children*. */
  gapX: number[];
  /** Vertical gap between a parent's bottom and its children's top, per depth of the children. */
  gapY: number[];
};

export type LaidOutNode = {
  node: PyramidNode;
  depth: number;
  x: number;
  y: number;
  w: number;
  h: number;
  parentId: string | null;
};

export type Edge = {
  from: string;
  to: string;
  /** Elbow path: parent bottom-centre → mid → child top-centre. */
  path: string;
};

export type PyramidLayout = {
  nodes: LaidOutNode[];
  edges: Edge[];
  byId: Record<string, LaidOutNode>;
  width: number;
  height: number;
};

const pick = (arr: number[], depth: number): number => arr[Math.min(depth, arr.length - 1)] ?? 0;

/** Subtree width: the wider of the node's own box and its children's row. */
const subtreeWidth = (node: PyramidNode, depth: number, cfg: LayoutConfig): number => {
  const own = pick(cfg.boxW, depth);
  const kids = node.children ?? [];
  if (kids.length === 0) return own;
  const gap = pick(cfg.gapX, depth + 1);
  const row = kids.reduce((sum, k) => sum + subtreeWidth(k, depth + 1, cfg), 0) + gap * (kids.length - 1);
  return Math.max(own, row);
};

/**
 * Lay out a tree with the root centred at the top. Coordinates are in the pyramid's own space
 * (0,0 = top-left of the bounding box). Depth limits let a scene render only the first N levels.
 */
export const layoutPyramid = (root: PyramidNode, cfg: LayoutConfig, maxDepth = Infinity): PyramidLayout => {
  const nodes: LaidOutNode[] = [];
  const edges: Edge[] = [];

  const place = (node: PyramidNode, depth: number, left: number, top: number, parentId: string | null): void => {
    const w = pick(cfg.boxW, depth);
    const h = pick(cfg.boxH, depth);
    const span = subtreeWidth(node, depth, cfg);
    const x = left + (span - w) / 2;
    nodes.push({ node, depth, x, y: top, w, h, parentId });

    const kids = node.children ?? [];
    if (kids.length === 0 || depth + 1 > maxDepth) return;
    const gap = pick(cfg.gapX, depth + 1);
    const rowW = kids.reduce((sum, k) => sum + subtreeWidth(k, depth + 1, cfg), 0) + gap * (kids.length - 1);
    let cursor = left + (span - rowW) / 2;
    const childTop = top + h + pick(cfg.gapY, depth + 1);
    for (const kid of kids) {
      const kw = subtreeWidth(kid, depth + 1, cfg);
      place(kid, depth + 1, cursor, childTop, node.id);
      cursor += kw + gap;
    }
  };

  place(root, 0, 0, 0, null);

  const byId: Record<string, LaidOutNode> = {};
  for (const n of nodes) byId[n.node.id] = n;
  for (const n of nodes) {
    if (!n.parentId) continue;
    const p = byId[n.parentId];
    if (!p) continue;
    const x1 = p.x + p.w / 2;
    const y1 = p.y + p.h;
    const x2 = n.x + n.w / 2;
    const y2 = n.y;
    const midY = (y1 + y2) / 2;
    edges.push({ from: p.node.id, to: n.node.id, path: `M ${x1} ${y1} V ${midY} H ${x2} V ${y2}` });
  }

  const width = Math.max(...nodes.map((n) => n.x + n.w));
  const height = Math.max(...nodes.map((n) => n.y + n.h));
  return { nodes, edges, byId, width, height };
};

/** All node ids at a given depth, in left-to-right order. */
export const idsAtDepth = (layout: PyramidLayout, depth: number): string[] =>
  layout.nodes.filter((n) => n.depth === depth).map((n) => n.node.id);

/** Ids of a node and everything under it. */
export const subtreeIds = (root: PyramidNode): string[] => [
  root.id,
  ...(root.children ?? []).flatMap((c) => subtreeIds(c)),
];

export const findNode = (root: PyramidNode, id: string): PyramidNode | null => {
  if (root.id === id) return root;
  for (const c of root.children ?? []) {
    const f = findNode(c, id);
    if (f) return f;
  }
  return null;
};

/**
 * Camera transform that frames `nodeId` (and its subtree, if `includeSubtree`) inside a viewport.
 * Returns the CSS translate/scale to apply to a wrapper whose untransformed origin is the layout's
 * (0,0) placed at `origin` in the viewport.
 */
export const frameNode = (
  layout: PyramidLayout,
  nodeId: string,
  viewport: { width: number; height: number; padding: number },
  origin: { x: number; y: number },
  includeSubtree: PyramidNode | null,
): { scale: number; tx: number; ty: number } => {
  const target = layout.byId[nodeId];
  if (!target) return { scale: 1, tx: 0, ty: 0 };
  let minX = target.x;
  let minY = target.y;
  let maxX = target.x + target.w;
  let maxY = target.y + target.h;
  if (includeSubtree) {
    for (const id of subtreeIds(includeSubtree)) {
      const n = layout.byId[id];
      if (!n) continue;
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + n.w);
      maxY = Math.max(maxY, n.y + n.h);
    }
  }
  const bw = maxX - minX;
  const bh = maxY - minY;
  const scale = Math.min(
    (viewport.width - viewport.padding * 2) / bw,
    (viewport.height - viewport.padding * 2) / bh,
  );
  const cx = minX + bw / 2;
  const cy = minY + bh / 2;
  // We want origin + (c * scale) + t = viewport centre.
  const tx = viewport.width / 2 - origin.x - cx * scale;
  const ty = viewport.height / 2 - origin.y - cy * scale;
  return { scale, tx, ty };
};
