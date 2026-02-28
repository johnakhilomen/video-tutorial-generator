import type { Page } from "playwright";
import { writeFile } from "fs/promises";
import { CONFIG } from "../config.js";
import { fileManager } from "../utils/file-manager.js";
import type { ScreenCapture } from "../types/index.js";

export class ScreenshotCapture {
  private captures: ScreenCapture[] = [];
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
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

    this.intervalHandle = setInterval(async () => {
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
    }, CONFIG.SCREENSHOT_INTERVAL_MS);
  }

  stopCapture(): ScreenCapture[] {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
    return [...this.captures];
  }

  getCaptures(): ScreenCapture[] {
    return [...this.captures];
  }
}
