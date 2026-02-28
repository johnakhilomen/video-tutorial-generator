import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
} from "remotion";
import type { CursorPosition } from "../../types/index.js";
import { LAYOUT } from "../utils/layout.js";

interface AnimatedCursorProps {
  positions: CursorPosition[];
  captureIntervalMs: number;
}

export const AnimatedCursor: React.FC<AnimatedCursorProps> = ({
  positions,
  captureIntervalMs,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (positions.length === 0) return null;

  // Convert timestamps to frame numbers
  const positionsWithFrames = positions.map((p) => ({
    ...p,
    frame: Math.round((p.timestamp / 1000) * fps),
    // Scale from capture viewport to 4K
    renderX: p.x * LAYOUT.scaleFactor,
    renderY: p.y * LAYOUT.scaleFactor,
  }));

  // Find the two positions we're interpolating between
  let prevPos = positionsWithFrames[0];
  let nextPos = positionsWithFrames[0];

  for (let i = 0; i < positionsWithFrames.length; i++) {
    if (positionsWithFrames[i].frame <= frame) {
      prevPos = positionsWithFrames[i];
      nextPos = positionsWithFrames[i + 1] ?? positionsWithFrames[i];
    }
  }

  // Smooth interpolation between positions using spring
  const progress =
    prevPos === nextPos || prevPos.frame === nextPos.frame
      ? 1
      : spring({
          frame: frame - prevPos.frame,
          fps,
          config: { damping: 20, stiffness: 120, mass: 0.5 },
          durationInFrames: nextPos.frame - prevPos.frame,
        });

  const x = interpolate(progress, [0, 1], [prevPos.renderX, nextPos.renderX]);
  const y = interpolate(progress, [0, 1], [prevPos.renderY, nextPos.renderY]);

  // Check if there's a click at the current frame
  const recentClick = positionsWithFrames.find(
    (p) =>
      p.action === "click" &&
      frame >= p.frame &&
      frame <= p.frame + fps * 0.5 // 0.5 second ripple
  );

  const clickProgress = recentClick
    ? (frame - recentClick.frame) / (fps * 0.5)
    : 0;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Click ripple effect */}
      {recentClick && clickProgress < 1 && (
        <div
          style={{
            position: "absolute",
            left: x - 30,
            top: y - 30,
            width: 60,
            height: 60,
            borderRadius: "50%",
            backgroundColor: LAYOUT.colors.clickRipple,
            transform: `scale(${1 + clickProgress * 2})`,
            opacity: 1 - clickProgress,
          }}
        />
      )}

      {/* Cursor */}
      <svg
        style={{
          position: "absolute",
          left: x - 2,
          top: y - 2,
          width: 32,
          height: 32,
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
        }}
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M5 3L19 12L12 13L9 20L5 3Z"
          fill={LAYOUT.colors.cursorColor}
          stroke={LAYOUT.colors.background}
          strokeWidth="1.5"
        />
      </svg>
    </AbsoluteFill>
  );
};
