import type { BrowserAction } from "../types/index.js";

export const VISION_SYSTEM_PROMPT = `You are a browser automation agent. You see screenshots of a web browser and decide what action to take next.

CRITICAL: You MUST respond with ONLY a single JSON object. No text before or after. No explanations. No markdown. JUST the JSON.

Available actions:

{"type":"click","x":450,"y":300,"description":"Click the Create button"}
{"type":"type","text":"Hello world","description":"Type the project name"}
{"type":"key","key":"Enter","description":"Press Enter to confirm"}
{"type":"scroll","deltaY":300,"description":"Scroll down to see more"}
{"type":"hover","x":600,"y":200,"description":"Hover over the File menu"}
{"type":"wait","waitMs":2000,"description":"Wait for page to load"}
{"type":"navigate","url":"https://example.com","description":"Navigate to URL"}
{"type":"step_complete","description":"Step goal achieved"}

Rules:
- Viewport is 1920x1080. Coordinates: x 0-1920, y 0-1080.
- Aim for the CENTER of target elements.
- For keyboard keys, use Playwright names: "Enter", "Tab", "Escape", "Backspace", "ArrowDown", "ArrowUp", "Control+t" (NOT "Ctrl"). Always use "Control" not "Ctrl".
- To navigate to a URL, use the "navigate" action with a "url" field. Do NOT try to click the address bar or type URLs.
- Do NOT open new tabs. Stay in the current tab. Use "navigate" to go to a new URL.
- Each step has a specific goal. Once the goal is reasonably achieved (you can see the expected result on screen), IMMEDIATELY output step_complete. Do not keep exploring or scrolling after the goal is met.
- Limit scrolling: if you have scrolled 3+ times in a row, the step is likely complete enough — output step_complete.
- ONLY output JSON. Any non-JSON response is an error.`;

export function buildVisionUserPrompt(
  stepTitle: string,
  browserInstructions: string,
  iterationCount: number,
  previousActions: BrowserAction[]
): string {
  const actionHistory =
    previousActions.length > 0
      ? `\nActions taken so far (${previousActions.length}):\n${previousActions
          .map((a, i) => `  ${i + 1}. [${a.type}] ${a.description}`)
          .join("\n")}\n`
      : "";

  const urgency =
    iterationCount >= 8
      ? "\n** YOU HAVE USED MANY ITERATIONS. Output step_complete NOW unless the step clearly has not started. **"
      : iterationCount >= 5
        ? "\n** Getting close to iteration limit. Wrap up this step soon. **"
        : "";

  return `STEP: "${stepTitle}"
GOAL: ${browserInstructions}
ITERATION: ${iterationCount}/10
${actionHistory}${urgency}
Output ONLY the JSON action. If the goal is achieved or close enough, output step_complete.`;
}
