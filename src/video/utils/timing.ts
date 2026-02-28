import { VIDEO } from "./layout.js";

/** Convert seconds to frames at the configured FPS */
export function secondsToFrames(seconds: number): number {
  return Math.ceil(seconds * VIDEO.FPS);
}

/** Convert frames to seconds */
export function framesToSeconds(frames: number): number {
  return frames / VIDEO.FPS;
}

/**
 * Map a video frame index to the corresponding screenshot index.
 * Screenshots are captured at SCREENSHOT_INTERVAL_MS intervals.
 * Video plays at FPS frames/second.
 * Each screenshot covers (SCREENSHOT_INTERVAL_MS / 1000) * FPS frames.
 */
export function frameToScreenshotIndex(
  frame: number,
  screenshotCount: number
): number {
  const framesPerScreenshot =
    (VIDEO.SCREENSHOT_INTERVAL_MS / 1000) * VIDEO.FPS;
  const index = Math.floor(frame / framesPerScreenshot);
  return Math.min(index, screenshotCount - 1);
}

/** Pad a frame index to a 5-digit string */
export function padFrameIndex(index: number): string {
  return String(index).padStart(5, "0");
}
