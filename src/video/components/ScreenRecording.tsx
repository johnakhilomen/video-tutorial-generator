import React from "react";
import { useCurrentFrame, useVideoConfig, Img, staticFile } from "remotion";
import { padFrameIndex } from "../utils/timing.js";
import { LAYOUT } from "../utils/layout.js";

interface ScreenRecordingProps {
  screenshotDir: string;
  screenshotCount: number;
  captureIntervalMs: number;
}

export const ScreenRecording: React.FC<ScreenRecordingProps> = ({
  screenshotDir,
  screenshotCount,
  captureIntervalMs,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Map current video frame to the screenshot index
  const framesPerScreenshot = (captureIntervalMs / 1000) * fps;
  const screenshotIndex = Math.min(
    Math.floor(frame / framesPerScreenshot),
    screenshotCount - 1
  );

  if (screenshotCount === 0) {
    return (
      <div
        style={{
          width: LAYOUT.width,
          height: LAYOUT.height,
          backgroundColor: LAYOUT.colors.background,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            color: LAYOUT.colors.textSecondary,
            fontSize: 48,
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          Loading...
        </div>
      </div>
    );
  }

  const imagePath = staticFile(
    `screenshots/${screenshotDir}/frame_${padFrameIndex(screenshotIndex)}.png`
  );

  return (
    <Img
      src={imagePath}
      style={{
        width: LAYOUT.width,
        height: LAYOUT.height,
        objectFit: "cover",
      }}
    />
  );
};
