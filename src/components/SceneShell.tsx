import React from "react";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { getNarration } from "../narration";
import { getScene } from "../timeline";
import { Captions } from "./Captions";
import { Paper } from "./Paper";

/**
 * Wraps every narrated scene: paper background, the scene's own narration clip starting after
 * its leading pad, and captions derived from that clip. Scene components only draw picture and
 * key their motion to `cue(sceneId, phrase)`.
 */
/** Set REMOTION_NO_CAPTIONS=1 when rendering stills for thumbnails or style frames. */
const CAPTIONS_DISABLED = typeof process !== "undefined" && process.env.REMOTION_NO_CAPTIONS === "1";

export const SceneShell: React.FC<{
  sceneId: string;
  tone?: "light" | "deep";
  captions?: boolean;
  children: React.ReactNode;
}> = ({ sceneId, tone, captions = true, children }) => {
  const { fps } = useVideoConfig();
  const scene = getScene(sceneId);
  const narration = getNarration(sceneId);
  const padFrames = Math.round(scene.padBeforeSec * fps);

  return (
    <AbsoluteFill>
      <Paper tone={tone}>{children}</Paper>
      {narration ? (
        <Sequence from={padFrames} durationInFrames={Math.ceil(narration.durationSec * fps)} layout="none">
          <Audio src={staticFile(narration.file)} />
        </Sequence>
      ) : null}
      {narration && captions && !CAPTIONS_DISABLED ? <Captions sceneId={sceneId} offsetMs={scene.padBeforeSec * 1000} /> : null}
    </AbsoluteFill>
  );
};

/** Frame at which the narration for this scene starts (the leading pad). */
export const useNarrationStart = (sceneId: string): number => {
  const { fps } = useVideoConfig();
  return Math.round(getScene(sceneId).padBeforeSec * fps);
};
