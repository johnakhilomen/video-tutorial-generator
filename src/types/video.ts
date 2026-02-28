import type { CursorPosition } from "./browser.js";
import type { ZoomTarget } from "./tutorial.js";

export interface VideoCompositionProps {
  title: string;
  description: string;
  steps: VideoStepData[];
  introDuration: number; // frames
  outroDuration: number; // frames
  totalDurationFrames: number;
}

export interface VideoStepData {
  id: string;
  title: string;
  screenshotDir: string;
  screenshotCount: number;
  captureIntervalMs: number;
  cursorPositions: CursorPosition[];
  narrationAudioPath: string;
  durationFrames: number;
  zoomTarget: ZoomTarget | null;
}

export type TransitionType = "fade" | "slide-left" | "wipe-down" | "zoom";

export interface SceneTransitionConfig {
  type: TransitionType;
  durationFrames: number;
}
