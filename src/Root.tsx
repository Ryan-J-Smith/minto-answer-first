import React from "react";
import { Composition, Folder } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Hook } from "./scenes/Hook";
import { Title } from "./scenes/Title";
import { Thesis } from "./scenes/Thesis";
import { Origin } from "./scenes/Origin";
import { Rules } from "./scenes/Rules";
import { Recursion } from "./scenes/Recursion";
import { Applications } from "./scenes/Applications";
import { Reach } from "./scenes/Reach";
import { NextSteps } from "./scenes/NextSteps";
import { Credits } from "./scenes/Credits";
import { Placeholder } from "./scenes/Placeholder";
import { FPS, HEIGHT, SCENE_ORDER, WIDTH, getScene, sceneDurationInFrames, totalDurationInFrames } from "./timeline";

/**
 * Scene id → component. One file per scene under src/scenes/. A scene missing here plays as a
 * Placeholder (real audio and captions, stand-in picture).
 */
const SCENE_COMPONENTS: Record<string, React.FC> = {
  "01-hook": Hook,
  "02-title": Title,
  "03-thesis": Thesis,
  "04-origin": Origin,
  "05-rules": Rules,
  "06-recursion": Recursion,
  "08-applications": Applications,
  "09-reach": Reach,
  "11-next-steps": NextSteps,
  "12-credits": Credits,
};

const sceneComponent = (id: string): React.FC => {
  const found = SCENE_COMPONENTS[id];
  if (found) return found;
  const Fallback: React.FC = () => <Placeholder sceneId={id} />;
  Fallback.displayName = `Placeholder(${id})`;
  return Fallback;
};

/** Crossfade length between scenes, in frames. Cuts land inside scripted pauses, so keep it short. */
export const FADE_FRAMES = 8;

/** The whole film, in SCENE_ORDER, with a short crossfade at every cut. */
export const AnswerFirst: React.FC = () => {
  return (
    <TransitionSeries>
      {SCENE_ORDER.flatMap((id, i) => {
        const Scene = sceneComponent(id);
        const seq = (
          <TransitionSeries.Sequence key={id} durationInFrames={sceneDurationInFrames(id)} name={getScene(id).title}>
            <Scene />
          </TransitionSeries.Sequence>
        );
        if (i === 0) return [seq];
        return [
          <TransitionSeries.Transition key={`${id}-fade`} presentation={fade()} timing={linearTiming({ durationInFrames: FADE_FRAMES })} />,
          seq,
        ];
      })}
    </TransitionSeries>
  );
};

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="AnswerFirst"
        component={AnswerFirst}
        durationInFrames={totalDurationInFrames() - FADE_FRAMES * (SCENE_ORDER.length - 1)}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Folder name="Scenes">
        {SCENE_ORDER.map((id) => (
          <Composition
            key={id}
            id={id}
            component={sceneComponent(id)}
            durationInFrames={sceneDurationInFrames(id)}
            fps={FPS}
            width={WIDTH}
            height={HEIGHT}
          />
        ))}
      </Folder>
    </>
  );
};
