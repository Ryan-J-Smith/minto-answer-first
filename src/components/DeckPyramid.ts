/**
 * Shared pyramid geometry for the deck and applications scenes, so the tree that folds into cards
 * in 07 is the exact tree that unfolds in 08.
 */
import type { LayoutConfig } from "./pyramid/layout";

export const DECK_TREE_CONFIG: LayoutConfig = {
  boxW: [600, 288, 88],
  boxH: [140, 124, 56],
  gapX: [0, 20, 8],
  gapY: [0, 90, 70],
};

/** Tree size with DECK_TREE_CONFIG: width 3 × 288 + 2 × 20 = 904 (the safe area), height 480. */
export const DECK_TREE_ORIGIN = { x: (1080 - 904) / 2, y: 232 };

/** Font sizes per depth for the shared tree. */
export const DECK_TREE_FONTS = [34, 24, 14];

export const mix = (a: number, b: number, p: number): number => a + (b - a) * p;

import { getNarration } from "../narration";

/**
 * Like `cue()`, but returns the first occurrence of `phrase` spoken at or after `afterSec`.
 * Needed when a word repeats in a scene (e.g. "answer" in 07-deck).
 */
export const cueAfter = (sceneId: string, phrase: string, afterSec: number, fallbackSec: number): number => {
  const scene = getNarration(sceneId);
  if (!scene) return fallbackSec;
  const norm = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const target = phrase.split(/\s+/).map(norm).filter(Boolean);
  const words = scene.words;
  for (let i = 0; i + target.length <= words.length; i++) {
    const first = words[i];
    if (!first || first.startMs / 1000 < afterSec) continue;
    let ok = true;
    for (let j = 0; j < target.length; j++) {
      if (norm(words[i + j]?.text ?? "") !== target[j]) {
        ok = false;
        break;
      }
    }
    if (ok) return first.startMs / 1000;
  }
  return fallbackSec;
};
