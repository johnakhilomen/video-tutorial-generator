import dotenv from "dotenv";
dotenv.config();

export const CONFIG = {
  // Browser
  VIEWPORT_WIDTH: 1920,
  VIEWPORT_HEIGHT: 1080,
  DEVICE_SCALE_FACTOR: 2,
  SCREENSHOT_INTERVAL_MS: 100,
  MAX_ITERATIONS_PER_STEP: 12,

  // Video
  OUTPUT_WIDTH: 3840,
  OUTPUT_HEIGHT: 2160,
  FPS: 30,
  MAX_DURATION_SECONDS: 300, // 5 minutes
  INTRO_DURATION_SECONDS: 3,
  OUTRO_DURATION_SECONDS: 3,
  TRANSITION_DURATION_FRAMES: 15,
  STEP_PADDING_SECONDS: 1,

  // AI
  PLANNER_MODEL: "claude-sonnet-4-20250514" as const,
  VISION_MODEL: "claude-sonnet-4-20250514" as const,
  VISION_MAX_TOKENS: 1024,

  // Voice
  ELEVENLABS_MODEL: "eleven_multilingual_v2",
  AUDIO_FORMAT: "mp3_44100_128" as const,

  // Rendering
  RENDER_CONCURRENCY: 3,
  JPEG_QUALITY: 90,

  // API Keys (from env)
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "",
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY ?? "",
  ELEVENLABS_VOICE_ID:
    process.env.ELEVENLABS_VOICE_ID ?? "Xb7hH8MSUJpSbSDYk0k2",
} as const;
