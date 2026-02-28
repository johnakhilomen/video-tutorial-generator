import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import type { VideoStepData } from "../../types/index.js";
import { ScreenRecording } from "../components/ScreenRecording.js";
import { AnimatedCursor } from "../components/AnimatedCursor.js";
import { ZoomPan } from "../components/ZoomPan.js";
import { TextOverlay } from "../components/TextOverlay.js";
import { StepBadge } from "../components/MotionGraphics.js";

interface StepSceneProps {
  step: VideoStepData;
  stepIndex: number;
  totalSteps: number;
}

export const StepScene: React.FC<StepSceneProps> = ({
  step,
  stepIndex,
  totalSteps,
}) => {
  return (
    <AbsoluteFill>
      {/* Background screen recording with optional zoom */}
      <ZoomPan zoomTarget={step.zoomTarget}>
        <ScreenRecording
          screenshotDir={step.screenshotDir}
          screenshotCount={step.screenshotCount}
          captureIntervalMs={step.captureIntervalMs}
        />
      </ZoomPan>

      {/* Animated cursor overlay */}
      <AnimatedCursor
        positions={step.cursorPositions}
        captureIntervalMs={step.captureIntervalMs}
      />

      {/* Step title overlay — appears for 3 seconds */}
      <TextOverlay
        text={step.title}
        position="bottom-left"
        appearFrame={0}
        disappearFrame={90}
      />

      {/* Step number badge */}
      <StepBadge stepIndex={stepIndex} totalSteps={totalSteps} />

      {/* Narration audio */}
      {step.narrationAudioPath && (
        <Audio src={staticFile(`audio/narration_step_${stepIndex}.mp3`)} />
      )}
    </AbsoluteFill>
  );
};
