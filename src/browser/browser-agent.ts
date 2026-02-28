import Anthropic from "@anthropic-ai/sdk";
import { chromium, type Browser, type Page } from "playwright";
import { z } from "zod";
import { CONFIG } from "../config.js";
import { VISION_SYSTEM_PROMPT, buildVisionUserPrompt } from "./prompts.js";
import { ActionExecutor } from "./action-executor.js";
import { CursorTracker } from "./cursor-tracker.js";
import { ScreenshotCapture } from "./screenshot-capture.js";
import { fileManager } from "../utils/file-manager.js";
import { logger } from "../utils/logger.js";
import type {
  TutorialPlan,
  TutorialStep,
  BrowserAction,
  StepRecording,
} from "../types/index.js";

const BrowserActionSchema = z.object({
  type: z.enum([
    "click",
    "type",
    "scroll",
    "navigate",
    "wait",
    "hover",
    "key",
    "step_complete",
  ]),
  x: z.number().optional(),
  y: z.number().optional(),
  text: z.string().optional(),
  url: z.string().optional(),
  key: z.string().optional(),
  deltaY: z.number().optional(),
  waitMs: z.number().optional(),
  selector: z.string().optional(),
  description: z.string(),
});

/** Extract JSON object from text that may contain non-JSON content */
function extractJson(text: string): string {
  // Try raw text first
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) {
    // Find the matching closing brace
    let depth = 0;
    for (let i = 0; i < trimmed.length; i++) {
      if (trimmed[i] === "{") depth++;
      if (trimmed[i] === "}") depth--;
      if (depth === 0) return trimmed.slice(0, i + 1);
    }
  }

  // Strip markdown code fences
  const fenced = trimmed.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  if (fenced.startsWith("{")) return extractJson(fenced);

  // Search for JSON object anywhere in the text
  const match = text.match(/\{[^{}]*"type"\s*:\s*"[^"]+?"[^{}]*\}/);
  if (match) return match[0];

  throw new Error(`No JSON found in response: ${trimmed.slice(0, 80)}...`);
}

export interface BrowserAgentOptions {
  headless?: boolean;
}

export class BrowserAgent {
  private client: Anthropic;
  private actionExecutor: ActionExecutor;
  private options: BrowserAgentOptions;

  constructor(apiKey: string, options: BrowserAgentOptions = {}) {
    this.client = new Anthropic({ apiKey });
    this.actionExecutor = new ActionExecutor();
    this.options = options;
  }

  async executeAllSteps(
    plan: TutorialPlan,
    workDir: string
  ): Promise<StepRecording[]> {
    const browser = await chromium.launch({
      headless: this.options.headless ?? true,
    });

    const context = await browser.newContext({
      viewport: {
        width: CONFIG.VIEWPORT_WIDTH,
        height: CONFIG.VIEWPORT_HEIGHT,
      },
      deviceScaleFactor: CONFIG.DEVICE_SCALE_FACTOR,
    });

    const page = await context.newPage();

    // Navigate to the target URL first
    logger.info(`Navigating to ${plan.targetUrl}`);
    await page.goto(plan.targetUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    // Give the page extra time to render
    await page.waitForTimeout(3000);

    const recordings: StepRecording[] = [];

    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i];
      logger.info(`Step ${i + 1}/${plan.steps.length}: ${step.title}`);

      const screenshotDir = await fileManager.createStepScreenshotDir(
        workDir,
        i
      );
      const recording = await this.executeStep(step, page, screenshotDir);
      recordings.push(recording);
    }

    await browser.close();
    return recordings;
  }

  private async executeStep(
    step: TutorialStep,
    page: Page,
    screenshotDir: string
  ): Promise<StepRecording> {
    const cursorTracker = new CursorTracker();
    const screenshotCapture = new ScreenshotCapture(screenshotDir);
    const previousActions: BrowserAction[] = [];
    const startTime = Date.now();

    // Start continuous screenshot capture in background
    screenshotCapture.startContinuousCapture(page);

    let iterationCount = 0;

    while (iterationCount < CONFIG.MAX_ITERATIONS_PER_STEP) {
      iterationCount++;

      try {
        // Take a screenshot for Claude to analyze
        const screenshot = await page.screenshot({
          type: "png",
          timeout: 10000,
          animations: "disabled",
        });
        const base64Screenshot = screenshot.toString("base64");

        // Ask Claude Vision what to do next
        const response = await this.client.messages.create({
          model: CONFIG.VISION_MODEL,
          max_tokens: CONFIG.VISION_MAX_TOKENS,
          system: VISION_SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: "image/png",
                    data: base64Screenshot,
                  },
                },
                {
                  type: "text",
                  text: buildVisionUserPrompt(
                    step.title,
                    step.browserInstructions,
                    iterationCount,
                    previousActions
                  ),
                },
              ],
            },
          ],
        });

        // Parse Claude's response
        const textBlock = response.content.find((b) => b.type === "text");
        if (!textBlock || textBlock.type !== "text") {
          logger.warn("No text response from vision agent, retrying...");
          continue;
        }

        const jsonText = extractJson(textBlock.text);
        const action = BrowserActionSchema.parse(JSON.parse(jsonText));

        // Check if step is complete
        if (action.type === "step_complete") {
          logger.success(`  Step complete: ${action.description}`);
          break;
        }

        // Execute the action
        await this.actionExecutor.execute(action, page);
        cursorTracker.record(action);
        previousActions.push(action);
      } catch (err) {
        logger.warn(
          `  Vision loop error (iteration ${iterationCount}): ${err instanceof Error ? err.message : String(err)}`
        );
        // Continue to next iteration — Claude will see the current state
      }
    }

    if (iterationCount >= CONFIG.MAX_ITERATIONS_PER_STEP) {
      logger.warn(`  Step hit max iterations (${CONFIG.MAX_ITERATIONS_PER_STEP})`);
    }

    // Stop continuous capture
    const captures = screenshotCapture.stopCapture();

    return {
      step,
      captures,
      cursorPositions: cursorTracker.getPositions(),
      actualDurationMs: Date.now() - startTime,
    };
  }
}
