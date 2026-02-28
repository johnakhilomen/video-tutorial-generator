import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { CONFIG } from "../config.js";
import { PLANNER_SYSTEM_PROMPT, buildPlannerUserPrompt } from "./prompts.js";
import { retry } from "../utils/retry.js";
import { logger } from "../utils/logger.js";
import type { TutorialPlan } from "../types/index.js";

const ZoomTargetSchema = z.object({
  description: z.string(),
});

const TutorialStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  narrationText: z.string(),
  browserInstructions: z.string(),
  expectedDurationSeconds: z.number(),
  zoomTarget: ZoomTargetSchema.nullable(),
});

const TutorialPlanSchema = z.object({
  title: z.string(),
  description: z.string(),
  targetUrl: z.string().url(),
  steps: z.array(TutorialStepSchema).min(3).max(10),
});

export class TutorialPlanner {
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async plan(prompt: string): Promise<TutorialPlan> {
    return retry(
      async () => {
        const spinner = logger.spinner("Claude is planning the tutorial...");

        try {
          const response = await this.client.messages.create({
            model: CONFIG.PLANNER_MODEL,
            max_tokens: 4096,
            system: PLANNER_SYSTEM_PROMPT,
            messages: [
              {
                role: "user",
                content: buildPlannerUserPrompt(prompt),
              },
            ],
          });

          const textBlock = response.content.find(
            (block) => block.type === "text"
          );
          if (!textBlock || textBlock.type !== "text") {
            throw new Error("No text response from Claude");
          }

          // Strip any markdown code fences if present
          let jsonText = textBlock.text.trim();
          if (jsonText.startsWith("```")) {
            jsonText = jsonText
              .replace(/^```(?:json)?\n?/, "")
              .replace(/\n?```$/, "");
          }

          const parsed = JSON.parse(jsonText);
          const validated = TutorialPlanSchema.parse(parsed);

          spinner.succeed("Tutorial plan generated");
          return validated;
        } catch (err) {
          spinner.fail("Failed to generate tutorial plan");
          throw err;
        }
      },
      { maxAttempts: 2, delayMs: 2000, label: "Tutorial planning" }
    );
  }
}
