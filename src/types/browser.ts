import type { TutorialStep } from "./tutorial.js";

export type BrowserActionType =
  | "click"
  | "type"
  | "scroll"
  | "navigate"
  | "wait"
  | "hover"
  | "key"
  | "step_complete";

export interface BrowserAction {
  type: BrowserActionType;
  x?: number;
  y?: number;
  text?: string;
  url?: string;
  key?: string;
  deltaY?: number;
  waitMs?: number;
  selector?: string;
  description: string;
}

export interface CursorPosition {
  x: number;
  y: number;
  timestamp: number;
  action: BrowserActionType;
}

export interface ScreenCapture {
  filePath: string;
  timestamp: number;
  frameIndex: number;
}

export interface StepRecording {
  step: TutorialStep;
  captures: ScreenCapture[];
  cursorPositions: CursorPosition[];
  actualDurationMs: number;
}
