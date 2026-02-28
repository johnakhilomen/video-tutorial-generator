import type { Page } from "playwright";
import type { BrowserAction } from "../types/index.js";
import { logger } from "../utils/logger.js";

/** Map common key name mistakes to valid Playwright key names */
const KEY_ALIASES: Record<string, string> = {
  Ctrl: "Control",
  ctrl: "Control",
  Cmd: "Meta",
  cmd: "Meta",
  Alt: "Alt",
  Return: "Enter",
  Esc: "Escape",
  Del: "Delete",
  Space: " ",
};

function normalizeKey(key: string): string {
  // Handle combo keys like "Ctrl+t" -> "Control+t"
  return key
    .split("+")
    .map((part) => KEY_ALIASES[part] ?? part)
    .join("+");
}

export class ActionExecutor {
  async execute(action: BrowserAction, page: Page): Promise<void> {
    logger.info(`  Action: ${action.description}`);

    switch (action.type) {
      case "click":
        if (action.x !== undefined && action.y !== undefined) {
          await page.mouse.move(action.x, action.y, { steps: 10 });
          await page.mouse.click(action.x, action.y);
        }
        break;

      case "type":
        if (action.text) {
          await page.keyboard.type(action.text, { delay: 50 });
        }
        break;

      case "key":
        if (action.key) {
          const normalized = normalizeKey(action.key);
          await page.keyboard.press(normalized);
        }
        break;

      case "scroll":
        await page.mouse.wheel(0, action.deltaY ?? 300);
        break;

      case "navigate":
        if (action.url) {
          await page.goto(action.url, {
            waitUntil: "domcontentloaded",
            timeout: 60000,
          });
          await page.waitForTimeout(2000);
        }
        break;

      case "wait":
        await page.waitForTimeout(action.waitMs ?? 2000);
        break;

      case "hover":
        if (action.x !== undefined && action.y !== undefined) {
          await page.mouse.move(action.x, action.y, { steps: 20 });
        }
        break;

      case "step_complete":
        break;

      default:
        logger.warn(`Unknown action type: ${action.type}`);
    }

    if (action.type !== "wait" && action.type !== "step_complete") {
      await page.waitForTimeout(500);
    }
  }
}
