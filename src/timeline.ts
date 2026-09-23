/**
 * The film's timeline: an ordered list of scenes with durations derived from narration.
 *
 * To remove a scene, delete its entry from `SCENE_ORDER`. To insert one, add its id to
 * `SCENE_ORDER` and its component to `SCENE_COMPONENTS` in Root.tsx. Narration text lives in
 * scenes.json; durations come from src/generated/narration.json.
 */
import scenesJson from "./scenes.json";
import { getNarration } from "./narration";

export type NarrationBeatSpec = { text: string; pause?: number };

export type SceneSpec = {
  id: string;
  title: string;
  /** Narration as spoken beats; joined text is available via `narrationText()`. */
  narration: NarrationBeatSpec[];
  /** Silence before the narration starts, in seconds. */
  padBeforeSec: number;
  /** Silence after the narration ends, in seconds. */
  padAfterSec: number;
  /** For scenes without narration: total duration in seconds. */
  fixedDurationSec?: number;
};

type ScenesFile = {
  fps: number;
  width: number;
  height: number;
  voice: string;
  scenes: Array<{
    id: string;
    title: string;
    narration: string | NarrationBeatSpec[];
    padBeforeSec?: number;
    padAfterSec?: number;
    fixedDurationSec?: number;
  }>;
};

const file = scenesJson as unknown as ScenesFile;

export const FPS = file.fps;
export const WIDTH = file.width;
export const HEIGHT = file.height;

export const SCENES: SceneSpec[] = file.scenes.map((s) => ({
  id: s.id,
  title: s.title,
  narration: typeof s.narration === "string" ? [{ text: s.narration }] : s.narration,
  padBeforeSec: s.padBeforeSec ?? 0.5,
  padAfterSec: s.padAfterSec ?? 1,
  fixedDurationSec: s.fixedDurationSec,
}));

/** Ordered list of scene ids that make the cut. Edit this to add, drop, or re-order scenes. */
export const SCENE_ORDER: string[] = SCENES.map((s) => s.id);

/** Full narration text of a scene (beats joined), for stand-ins and debugging. */
export const narrationText = (id: string): string =>
  getScene(id).narration.map((b) => b.text).join(" ");

export const getScene = (id: string): SceneSpec => {
  const found = SCENES.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown scene id: ${id}`);
  return found;
};

/** Duration of a scene in seconds: padding + narration length, or the fixed duration. */
export const sceneDurationSec = (id: string): number => {
  const scene = getScene(id);
  if (scene.fixedDurationSec !== undefined) return scene.fixedDurationSec;
  const narration = getNarration(id);
  const audio = narration?.durationSec ?? 0;
  return scene.padBeforeSec + audio + scene.padAfterSec;
};

export const sceneDurationInFrames = (id: string): number =>
  Math.max(1, Math.ceil(sceneDurationSec(id) * FPS));

export const totalDurationInFrames = (): number =>
  SCENE_ORDER.reduce((sum, id) => sum + sceneDurationInFrames(id), 0);
