// Browser-safe constants — no Node.js imports allowed here
// These values must match CONFIG in ../../config.ts

export const VIDEO = {
  OUTPUT_WIDTH: 3840,
  OUTPUT_HEIGHT: 2160,
  FPS: 30,
  DEVICE_SCALE_FACTOR: 2,
  INTRO_DURATION_SECONDS: 3,
  OUTRO_DURATION_SECONDS: 3,
  TRANSITION_DURATION_FRAMES: 15,
  SCREENSHOT_INTERVAL_MS: 100,
} as const;

export const LAYOUT = {
  width: VIDEO.OUTPUT_WIDTH,
  height: VIDEO.OUTPUT_HEIGHT,

  /** Scale factor from capture viewport to 4K output */
  scaleFactor: VIDEO.DEVICE_SCALE_FACTOR,

  /** Text overlay padding from edges */
  overlayPadding: 60,

  /** Progress bar height */
  progressBarHeight: 6,

  /** Title font sizes */
  introTitleSize: 96,
  introSubtitleSize: 48,
  stepTitleSize: 56,
  outroTitleSize: 80,
  outroSubtitleSize: 40,

  /** Colors */
  colors: {
    background: "#0a0a0f",
    primary: "#6366f1",
    primaryLight: "#818cf8",
    accent: "#22d3ee",
    text: "#f8fafc",
    textSecondary: "#94a3b8",
    overlayBg: "rgba(10, 10, 15, 0.85)",
    progressBg: "rgba(255, 255, 255, 0.1)",
    progressFill: "#6366f1",
    cursorColor: "#ffffff",
    clickRipple: "rgba(99, 102, 241, 0.5)",
  },
} as const;
