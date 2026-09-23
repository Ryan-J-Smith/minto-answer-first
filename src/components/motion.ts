import { interpolate } from "remotion";
import { easeOut } from "../theme";

/**
 * 0→1 progress for an entrance that begins at `startFrame` and lasts `durationFrames`.
 * Clamped, ease-out. Use for opacity, translate, and draw-on lengths.
 */
export const enter = (frame: number, startFrame: number, durationFrames: number): number =>
  interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });

/** Seconds → frames helper that keeps scene code readable. */
export const sec = (seconds: number, fps: number): number => Math.round(seconds * fps);
