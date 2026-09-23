import React from "react";
import { AbsoluteFill } from "remotion";
import { colors, palette } from "../theme";

/**
 * The film's background: a deep navy field with a slow radial glow toward one corner, the way a
 * strategy-firm keynote is lit. No texture. (The component keeps its original name, `Paper`, so
 * every scene's import still works; `Backdrop` is the same thing under its current name.)
 *
 * `tone="deep"` pulls the glow back for the bookends (title, reveal, credits).
 */
export const Paper: React.FC<{ children?: React.ReactNode; tone?: "light" | "deep" }> = ({
  children,
  tone = "light",
}) => {
  const glowStrength = tone === "deep" ? 0.55 : 0.85;
  if (palette.mode === "light") {
    return (
      <AbsoluteFill style={{ backgroundColor: tone === "deep" ? colors.surfaceDeep : colors.bg }}>
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.35) 0%, rgba(0,0,0,0) 55%, rgba(28,35,51,0.10) 100%)",
          }}
        />
        <AbsoluteFill>{children}</AbsoluteFill>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 90% at 88% 100%, ${colors.bgGlow} 0%, transparent 60%)`,
          opacity: glowStrength,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(70% 60% at 10% 0%, ${colors.bgGlow}80 0%, transparent 60%)`,
          opacity: glowStrength,
        }}
      />
      <AbsoluteFill>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Backdrop = Paper;
