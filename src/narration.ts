/**
 * Typed access to the narration manifest written by scripts/narration/generate.py.
 *
 * Scenes key their animations to spoken words via `cue()`, so re-generating the
 * audio (or re-ordering scenes) never desynchronises picture from voice.
 */
import type { Caption } from "@remotion/captions";
import manifest from "./generated/narration.json";

export type NarrationWord = {
  text: string;
  startMs: number;
  endMs: number;
};

export type NarrationBeat = {
  index: number;
  text: string;
  startMs: number;
  endMs: number;
  pauseSec: number;
};

export type SceneNarration = {
  file: string;
  durationSec: number;
  textHash: string;
  words: NarrationWord[];
  beats: NarrationBeat[];
};

/** Seconds (from narration start) at which beat `index` (0-based) begins speaking. */
export const beatStart = (sceneId: string, index: number, fallbackSec = 0): number => {
  const b = getNarration(sceneId)?.beats[index];
  return b ? b.startMs / 1000 : fallbackSec;
};

/** Seconds at which beat `index` stops speaking (its scripted pause begins). */
export const beatEnd = (sceneId: string, index: number, fallbackSec = 0): number => {
  const b = getNarration(sceneId)?.beats[index];
  return b ? b.endMs / 1000 : fallbackSec;
};

type Manifest = {
  voice: string | null;
  sampleRate: number;
  scenes: Record<string, SceneNarration>;
};

const typedManifest = manifest as Manifest;

export const getNarration = (sceneId: string): SceneNarration | null => {
  return typedManifest.scenes[sceneId] ?? null;
};

const normalise = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]+/g, "");

/**
 * Seconds (from the start of the narration clip) at which `phrase` begins.
 * Matches the first occurrence of the phrase's words in order, ignoring punctuation and case.
 * Falls back to `fallbackSec` (default 0) if the phrase is not found, so a script edit degrades
 * gracefully instead of throwing during render.
 */
export const cue = (sceneId: string, phrase: string, fallbackSec = 0): number => {
  const scene = getNarration(sceneId);
  if (!scene) return fallbackSec;
  const target = phrase.split(/\s+/).map(normalise).filter(Boolean);
  if (target.length === 0) return fallbackSec;
  const words = scene.words;
  for (let i = 0; i + target.length <= words.length; i++) {
    let ok = true;
    for (let j = 0; j < target.length; j++) {
      if (normalise(words[i + j]?.text ?? "") !== target[j]) {
        ok = false;
        break;
      }
    }
    if (ok) return (words[i]?.startMs ?? 0) / 1000;
  }
  return fallbackSec;
};

/** Seconds at which `phrase` finishes being spoken. */
export const cueEnd = (sceneId: string, phrase: string, fallbackSec = 0): number => {
  const scene = getNarration(sceneId);
  if (!scene) return fallbackSec;
  const target = phrase.split(/\s+/).map(normalise).filter(Boolean);
  const words = scene.words;
  for (let i = 0; i + target.length <= words.length; i++) {
    let ok = true;
    for (let j = 0; j < target.length; j++) {
      if (normalise(words[i + j]?.text ?? "") !== target[j]) {
        ok = false;
        break;
      }
    }
    if (ok) return (words[i + target.length - 1]?.endMs ?? 0) / 1000;
  }
  return fallbackSec;
};

/** Convert a scene's word timings into Remotion's Caption format (leading-space tokens). */
export const toCaptions = (sceneId: string, offsetMs: number): Caption[] => {
  const scene = getNarration(sceneId);
  if (!scene) return [];
  return scene.words.map((w) => ({
    text: ` ${w.text}`,
    startMs: w.startMs + offsetMs,
    endMs: w.endMs + offsetMs,
    timestampMs: null,
    confidence: null,
    // Start a new caption page at sentence boundaries so pages read as phrases.
    pageBreakAfter: /[.?!]["”]?$/.test(w.text),
  }));
};
