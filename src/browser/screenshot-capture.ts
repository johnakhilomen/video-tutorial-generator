import type { Page } from "playwright";
import { writeFile } from "fs/promises";
import { CONFIG } from "../config.js";
import { fileManager } from "../utils/file-manager.js";
import type { ScreenCapture } from "../types/index.js";

export class ScreenshotCapture {
  private captures: ScreenCapture[] = [];
  private running = false;
  private frameIndex = 0;
  private startTime = 0;
  private outputDir: string;

  constructor(outputDir: string) {
    this.outputDir = outputDir;
  }

  startContinuousCapture(page: Page): void {
    this.startTime = Date.now();
    this.frameIndex = 0;
    this.captures = [];
    this.running = true;

    // Use a sequential async loop instead of setInterval to prevent
    // overlapping screenshot calls that silently fail
    const captureLoop = async () => {
      while (this.running) {
        const loopStart = Date.now();
        try {
          const buffer = await page.screenshot({
            type: "png",
            timeout: 5000,
            animations: "disabled",
          });
          const filePath = fileManager.screenshotPath(
            this.outputDir,
            this.frameIndex
          );
          await writeFile(filePath, buffer);

          this.captures.push({
            filePath,
            timestamp: Date.now() - this.startTime,
            frameIndex: this.frameIndex,
          });

          this.frameIndex++;
        } catch {
          // Page might be navigating — skip this frame
        }

        // Wait for the remainder of the interval
        const elapsed = Date.now() - loopStart;
        const wait = Math.max(0, CONFIG.SCREENSHOT_INTERVAL_MS - elapsed);
        if (wait > 0 && this.running) {
          await new Promise((r) => setTimeout(r, wait));
        }
      }
    };

    // Fire and forget — runs in background
    captureLoop();
  }

  stopCapture(): ScreenCapture[] {
    this.running = false;
    return [...this.captures];
  }

  getCaptures(): ScreenCapture[] {
    return [...this.captures];
  }
}
