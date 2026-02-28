import { mkdtemp, mkdir, rm, readdir, copyFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { existsSync } from "fs";

export const fileManager = {
  async createWorkDirectory(): Promise<string> {
    const workDir = await mkdtemp(join(tmpdir(), "vtgen-"));
    await mkdir(join(workDir, "screenshots"), { recursive: true });
    await mkdir(join(workDir, "audio"), { recursive: true });
    return workDir;
  },

  async createStepScreenshotDir(workDir: string, stepIndex: number): Promise<string> {
    const dir = join(workDir, "screenshots", `step_${stepIndex}`);
    await mkdir(dir, { recursive: true });
    return dir;
  },

  async ensureDir(dir: string): Promise<void> {
    await mkdir(dir, { recursive: true });
  },

  async cleanup(workDir: string): Promise<void> {
    if (existsSync(workDir)) {
      await rm(workDir, { recursive: true, force: true });
    }
  },

  async copyToPublic(
    sourceDir: string,
    publicDir: string,
    prefix: string
  ): Promise<string> {
    const destDir = join(publicDir, prefix);
    await mkdir(destDir, { recursive: true });
    const files = await readdir(sourceDir);
    for (const file of files) {
      await copyFile(join(sourceDir, file), join(destDir, file));
    }
    return destDir;
  },

  screenshotPath(dir: string, frameIndex: number): string {
    return join(dir, `frame_${String(frameIndex).padStart(5, "0")}.png`);
  },

  audioPath(workDir: string, stepIndex: number): string {
    return join(workDir, "audio", `narration_step_${stepIndex}.mp3`);
  },

  outputPath(title: string): string {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    return join("output", `${slug}.mp4`);
  },
};
