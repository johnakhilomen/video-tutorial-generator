import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
} from "remotion";
import type { ZoomTarget } from "../../types/index.js";

interface ZoomPanProps {
  zoomTarget: ZoomTarget | null;
  children: React.ReactNode;
}

export const ZoomPan: React.FC<ZoomPanProps> = ({ zoomTarget, children }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  if (!zoomTarget || !zoomTarget.x || !zoomTarget.y) {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  const scale = zoomTarget.scale ?? 1.8;

  // Zoom in during the first 1 second, hold, zoom out in the last 1 second
  const zoomInDuration = fps; // 1 second
  const zoomOutStart = durationInFrames - fps;

  const zoomInProgress = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 80 },
    durationInFrames: zoomInDuration,
  });

  const zoomOutProgress =
    frame >= zoomOutStart
      ? spring({
          frame: frame - zoomOutStart,
          fps,
          config: { damping: 20, stiffness: 80 },
          durationInFrames: fps,
        })
      : 0;

  const currentScale = interpolate(
    zoomInProgress - zoomOutProgress,
    [0, 1],
    [1, scale],
    { extrapolateRight: "clamp" }
  );

  // Translate so the zoom target is centered
  const translateX = interpolate(
    zoomInProgress - zoomOutProgress,
    [0, 1],
    [0, -(zoomTarget.x ?? 0) * (scale - 1)],
    { extrapolateRight: "clamp" }
  );

  const translateY = interpolate(
    zoomInProgress - zoomOutProgress,
    [0, 1],
    [0, -(zoomTarget.y ?? 0) * (scale - 1)],
    { extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${currentScale}) translate(${translateX}px, ${translateY}px)`,
        transformOrigin: "top left",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
