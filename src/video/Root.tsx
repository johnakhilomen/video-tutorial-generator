import React from "react";
import { Composition } from "remotion";
import { TutorialVideo } from "./compositions/TutorialVideo.js";
import type { VideoCompositionProps } from "../types/index.js";
import { VIDEO } from "./utils/layout.js";

export const RemotionRoot: React.FC = () => {
  const defaultProps = {
    title: "Tutorial Preview",
    description: "Preview composition",
    steps: [],
    introDuration: VIDEO.INTRO_DURATION_SECONDS * VIDEO.FPS,
    outroDuration: VIDEO.OUTRO_DURATION_SECONDS * VIDEO.FPS,
    totalDurationFrames: VIDEO.FPS * 10,
  } satisfies VideoCompositionProps;

  return (
    <Composition
      id="TutorialVideo"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      component={TutorialVideo as any}
      durationInFrames={300}
      fps={VIDEO.FPS}
      width={VIDEO.OUTPUT_WIDTH}
      height={VIDEO.OUTPUT_HEIGHT}
      defaultProps={defaultProps}
      calculateMetadata={({ props }) => {
        const p = props as unknown as VideoCompositionProps;
        return {
          durationInFrames: p.totalDurationFrames,
        };
      }}
    />
  );
};
