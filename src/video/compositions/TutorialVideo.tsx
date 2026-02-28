import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import type { VideoCompositionProps } from "../../types/index.js";
import { IntroScene } from "../scenes/IntroScene.js";
import { StepScene } from "../scenes/StepScene.js";
import { OutroScene } from "../scenes/OutroScene.js";
import { SceneTransition } from "../components/SceneTransition.js";
import { ProgressBar } from "../components/ProgressBar.js";
import { LAYOUT, VIDEO } from "../utils/layout.js";

export const TutorialVideo: React.FC<VideoCompositionProps> = (props) => {
  const { title, description, steps, introDuration, outroDuration } = props;
  const transitionDuration = VIDEO.TRANSITION_DURATION_FRAMES;

  let currentFrame = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: LAYOUT.colors.background }}>
      {/* Intro Scene */}
      <Sequence from={currentFrame} durationInFrames={introDuration}>
        <IntroScene title={title} description={description} />
      </Sequence>

      {(() => {
        currentFrame += introDuration;
        return null;
      })()}

      {/* Tutorial Steps */}
      {steps.map((step, i) => {
        const stepStart = currentFrame;
        const stepDuration = step.durationFrames;

        // Advance the frame counter
        currentFrame += stepDuration;

        const transitions: TransitionType[] = [
          "fade",
          "slide-left",
          "wipe-down",
          "zoom",
        ];
        const transitionType = transitions[i % transitions.length];

        return (
          <React.Fragment key={step.id}>
            {/* Transition into this step */}
            {i > 0 && (
              <Sequence
                from={stepStart - transitionDuration}
                durationInFrames={transitionDuration * 2}
              >
                <SceneTransition type={transitionType} />
              </Sequence>
            )}

            {/* Step content */}
            <Sequence from={stepStart} durationInFrames={stepDuration}>
              <StepScene
                step={step}
                stepIndex={i}
                totalSteps={steps.length}
              />
            </Sequence>
          </React.Fragment>
        );
      })}

      {/* Transition to outro */}
      <Sequence
        from={currentFrame - transitionDuration}
        durationInFrames={transitionDuration * 2}
      >
        <SceneTransition type="fade" />
      </Sequence>

      {/* Outro Scene */}
      <Sequence from={currentFrame} durationInFrames={outroDuration}>
        <OutroScene title={title} />
      </Sequence>

      {/* Progress bar across entire video */}
      <ProgressBar totalSteps={steps.length} />
    </AbsoluteFill>
  );
};

// Import for type reference
type TransitionType = "fade" | "slide-left" | "wipe-down" | "zoom";
