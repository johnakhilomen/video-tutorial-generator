import { writeFile, readFile } from "fs/promises";
import { existsSync } from "fs";
import { join, basename, dirname } from "path";
import { CONFIG } from "./config.js";
import { logger } from "./utils/logger.js";
import { fileManager } from "./utils/file-manager.js";
import { TutorialPlanner } from "./planner/index.js";
import { BrowserAgent } from "./browser/index.js";
import { VoiceGenerator } from "./voice/index.js";
import { renderTutorialVideo } from "./video/index.js";
import type {
  TutorialPlan,
  StepRecording,
  AudioSegment,
  VideoCompositionProps,
  VideoStepData,
} from "./types/index.js";

export interface PipelineOptions {
  voiceId?: string;
  headless?: boolean;
  preview?: boolean;
  skipVoice?: boolean;
}

/** Saved pipeline state — each field is saved independently */
interface PipelineState {
  prompt: string;
  workDir: string;
  plan?: TutorialPlan;
  stepRecordings?: StepRecording[];
  audioSegments?: AudioSegment[];
}

const STATE_DIR = "output/.pipeline-state";

async function saveState(state: PipelineState): Promise<void> {
  await fileManager.ensureDir(STATE_DIR);
  const statePath = join(STATE_DIR, "latest.json");
  await writeFile(statePath, JSON.stringify(state, null, 2));
  logger.success("Progress saved");
}

async function loadState(): Promise<PipelineState | null> {
  const statePath = join(STATE_DIR, "latest.json");
  if (!existsSync(statePath)) return null;
  try {
    const data = await readFile(statePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function runPipeline(
  prompt: string,
  options: PipelineOptions = {}
): Promise<string> {
  const totalStages = 4;

  // Check for saved state from a previous run with the same prompt
  const saved = await loadState();
  const hasMatch = saved && saved.prompt === prompt && existsSync(saved.workDir);

  const workDir = hasMatch ? saved.workDir : await fileManager.createWorkDirectory();
  const state: PipelineState = hasMatch ? saved : { prompt, workDir };

  if (hasMatch) {
    const parts = [];
    if (state.plan) parts.push("plan");
    if (state.stepRecordings) parts.push("recordings");
    if (state.audioSegments) parts.push("audio");
    if (parts.length > 0) {
      logger.info(`Resuming with saved: ${parts.join(", ")}`);
    }
  }

  try {
    // ──── Stage 1: Plan ────
    let plan: TutorialPlan;
    if (state.plan) {
      plan = state.plan;
      logger.success(`[1/${totalStages}] Plan loaded: "${plan.title}" (${plan.steps.length} steps)`);
    } else {
      logger.step(1, totalStages, "Planning tutorial...");
      const planner = new TutorialPlanner(CONFIG.ANTHROPIC_API_KEY);
      plan = await planner.plan(prompt);
      logger.success(`Planned ${plan.steps.length} steps: "${plan.title}"`);
      state.plan = plan;
      await saveState(state);
    }

    // ──── Stage 2: Browser recording ────
    let stepRecordings: StepRecording[];
    if (state.stepRecordings) {
      stepRecordings = state.stepRecordings;
      logger.success(`[2/${totalStages}] Browser recordings loaded (${stepRecordings.length} steps)`);
    } else {
      logger.step(2, totalStages, "Recording browser session...");
      const browserAgent = new BrowserAgent(CONFIG.ANTHROPIC_API_KEY, {
        headless: options.headless ?? true,
      });
      stepRecordings = await browserAgent.executeAllSteps(plan, workDir);
      state.stepRecordings = stepRecordings;
      await saveState(state);
    }

    // ──── Stage 3: Voice narration ────
    let audioSegments: AudioSegment[];
    if (state.audioSegments) {
      audioSegments = state.audioSegments;
      logger.success(`[3/${totalStages}] Audio narrations loaded (${audioSegments.length} clips)`);
    } else if (options.skipVoice) {
      logger.step(3, totalStages, "Skipping narration (--skip-voice)");
      // Create silent placeholders — duration based on step's expected time
      audioSegments = plan.steps.map((step, i) => ({
        filePath: "",
        durationSeconds: step.expectedDurationSeconds,
        text: step.narrationText,
      }));
      state.audioSegments = audioSegments;
      await saveState(state);
    } else {
      logger.step(3, totalStages, "Generating narration...");
      const voiceGenerator = new VoiceGenerator(
        CONFIG.ELEVENLABS_API_KEY,
        options.voiceId ?? CONFIG.ELEVENLABS_VOICE_ID
      );
      audioSegments = await voiceGenerator.generateAllNarrations(plan.steps, workDir);
      state.audioSegments = audioSegments;
      await saveState(state);
    }

    // ──── Stage 4: Render video ────
    logger.step(4, totalStages, "Rendering video...");

    // Copy screenshots to Remotion's public/ directory so staticFile() can serve them
    const publicDir = join(dirname(new URL(import.meta.url).pathname), "video", "public");
    const screenshotsPublicDir = join(publicDir, "screenshots");
    await fileManager.ensureDir(screenshotsPublicDir);

    for (let i = 0; i < stepRecordings.length; i++) {
      const rec = stepRecordings[i];
      if (rec.captures.length === 0) continue;
      const sourceDir = dirname(rec.captures[0].filePath);
      await fileManager.copyToPublic(sourceDir, screenshotsPublicDir, `step_${i}`);
      logger.info(`  Copied ${rec.captures.length} screenshots for step ${i}`);
    }

    const compositionProps = buildCompositionProps(
      plan,
      stepRecordings,
      audioSegments,
      workDir
    );

    await fileManager.ensureDir("output");
    const outputPath = fileManager.outputPath(plan.title);

    if (options.preview) {
      logger.info("Preview mode — open Remotion Studio to view the composition");
      return outputPath;
    }

    await renderTutorialVideo(compositionProps, outputPath, (progress) => {
      logger.progress("Rendering", progress);
    });

    // Cleanup only after successful render
    await fileManager.cleanup(workDir);
    await fileManager.cleanup(STATE_DIR);

    return outputPath;
  } catch (err) {
    // Save whatever progress we have before throwing
    try {
      await saveState(state);
    } catch {
      // ignore save errors during error handling
    }
    logger.warn(`Work directory preserved at: ${workDir}`);
    logger.warn("Re-run the same prompt to resume from saved progress.");
    throw err;
  }
}

function buildCompositionProps(
  plan: TutorialPlan,
  recordings: StepRecording[],
  audioSegments: AudioSegment[],
  workDir: string
): VideoCompositionProps {
  const FPS = CONFIG.FPS;
  const INTRO_DURATION = CONFIG.INTRO_DURATION_SECONDS * FPS;
  const OUTRO_DURATION = CONFIG.OUTRO_DURATION_SECONDS * FPS;
  const STEP_PADDING = CONFIG.STEP_PADDING_SECONDS * FPS;

  const steps: VideoStepData[] = recordings.map((rec, i) => {
    const audio = audioSegments[i];
    const durationFrames =
      Math.ceil(audio.durationSeconds * FPS) + STEP_PADDING;

    return {
      id: rec.step.id,
      title: rec.step.title,
      screenshotDir: `step_${i}`,
      screenshotCount: rec.captures.length,
      captureIntervalMs: CONFIG.SCREENSHOT_INTERVAL_MS,
      cursorPositions: rec.cursorPositions,
      narrationAudioPath: audio.filePath,
      durationFrames,
      zoomTarget: rec.step.zoomTarget,
    };
  });

  const totalDurationFrames =
    INTRO_DURATION +
    steps.reduce((sum, s) => sum + s.durationFrames, 0) +
    OUTRO_DURATION;

  const MAX_FRAMES = CONFIG.MAX_DURATION_SECONDS * FPS;

  return {
    title: plan.title,
    description: plan.description,
    steps,
    introDuration: INTRO_DURATION,
    outroDuration: OUTRO_DURATION,
    totalDurationFrames: Math.min(totalDurationFrames, MAX_FRAMES),
  };
}
