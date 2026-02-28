#!/usr/bin/env node
import { Command } from "commander";
import { runPipeline } from "./pipeline.js";
import { logger } from "./utils/logger.js";

const program = new Command();

program
  .name("vtgen")
  .description("AI-powered video tutorial generator")
  .version("1.0.0");

program
  .command("generate")
  .description("Generate a video tutorial from a prompt")
  .argument("<prompt>", "Tutorial topic (e.g. 'Make a tutorial on Figma Make')")
  .option("--voice <voiceId>", "ElevenLabs voice ID")
  .option("--no-headless", "Show browser window during recording")
  .option("--preview", "Open Remotion preview instead of rendering")
  .option("--skip-voice", "Skip voice narration (no ElevenLabs needed)")
  .action(async (prompt: string, options) => {
    try {
      logger.info(`Starting video tutorial generation...`);
      logger.info(`Prompt: "${prompt}"`);

      const outputPath = await runPipeline(prompt, {
        voiceId: options.voice,
        headless: options.headless !== false,
        preview: options.preview ?? false,
        skipVoice: options.skipVoice ?? false,
      });

      logger.success(`Video saved to: ${outputPath}`);
    } catch (err) {
      logger.error("Pipeline failed", err);
      process.exit(1);
    }
  });

program.parse();
