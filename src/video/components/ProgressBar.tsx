import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { LAYOUT } from "../utils/layout.js";

interface ProgressBarProps {
  totalSteps: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ totalSteps }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: LAYOUT.width,
        height: LAYOUT.progressBarHeight,
        backgroundColor: LAYOUT.colors.progressBg,
        zIndex: 50,
      }}
    >
      {/* Filled progress */}
      <div
        style={{
          width: `${progress}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${LAYOUT.colors.primary}, ${LAYOUT.colors.accent})`,
          borderRadius: "0 3px 3px 0",
          transition: "width 0.1s linear",
        }}
      />
    </div>
  );
};
