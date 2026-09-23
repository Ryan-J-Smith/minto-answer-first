import React from "react";
import { AbsoluteFill } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { getScene, narrationText } from "../timeline";
import { colors, layout, type } from "../theme";

/**
 * Stand-in for scenes not yet designed. Plays the real narration and captions so the whole
 * film can be reviewed for pacing before the picture exists.
 */
export const Placeholder: React.FC<{ sceneId: string }> = ({ sceneId }) => {
  const scene = getScene(sceneId);
  return (
    <SceneShell sceneId={sceneId} tone="deep">
      <AbsoluteFill style={{ padding: layout.margin, boxSizing: "border-box" }}>
        <div style={{ ...type.eyebrow, color: colors.inkSoft }}>{scene.id.toUpperCase()} · PLACEHOLDER</div>
        <div style={{ ...type.headline, color: colors.ink, marginTop: 28 }}>{scene.title}</div>
        <div style={{ ...type.small, color: colors.inkSoft, marginTop: 40, maxWidth: 820 }}>{narrationText(sceneId)}</div>
      </AbsoluteFill>
    </SceneShell>
  );
};
