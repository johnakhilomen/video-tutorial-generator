import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, AbsoluteFill } from "remotion";
import type { TransitionType } from "../../types/index.js";
import { LAYOUT } from "../utils/layout.js";

interface SceneTransitionProps {
  type?: TransitionType;
}

export const SceneTransition: React.FC<SceneTransitionProps> = ({
  type = "fade",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const midpoint = Math.floor(durationInFrames / 2);

  switch (type) {
    case "fade": {
      const opacity = interpolate(
        frame,
        [0, midpoint, durationInFrames],
        [0, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );
      return (
        <AbsoluteFill
          style={{
            backgroundColor: LAYOUT.colors.background,
            opacity,
            zIndex: 100,
          }}
        />
      );
    }

    case "slide-left": {
      const progress = interpolate(
        frame,
        [0, durationInFrames],
        [LAYOUT.width, -LAYOUT.width],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );
      return (
        <AbsoluteFill
          style={{
            backgroundColor: LAYOUT.colors.primary,
            transform: `translateX(${progress}px)`,
            zIndex: 100,
          }}
        />
      );
    }

    case "wipe-down": {
      const progress = interpolate(
        frame,
        [0, midpoint, durationInFrames],
        [-LAYOUT.height, 0, LAYOUT.height],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );
      return (
        <AbsoluteFill
          style={{
            backgroundColor: LAYOUT.colors.background,
            transform: `translateY(${progress}px)`,
            zIndex: 100,
          }}
        />
      );
    }

    case "zoom": {
      const scale = interpolate(
        frame,
        [0, midpoint, durationInFrames],
        [0, 1.2, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );
      const opacity = interpolate(
        frame,
        [0, midpoint, durationInFrames],
        [0, 1, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );
      return (
        <AbsoluteFill
          style={{
            backgroundColor: LAYOUT.colors.background,
            transform: `scale(${scale})`,
            opacity,
            zIndex: 100,
          }}
        />
      );
    }

    default:
      return null;
  }
};
