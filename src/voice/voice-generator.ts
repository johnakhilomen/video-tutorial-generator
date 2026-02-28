import { ElevenLabsClient } from "elevenlabs";
import { writeFile } from "fs/promises";
import { CONFIG } from "../config.js";
import { getAudioDuration } from "./audio-utils.js";
import { fileManager } from "../utils/file-manager.js";
import { retry } from "../utils/retry.js";
import { logger } from "../utils/logger.js";
import type { TutorialStep, AudioSegment } from "../types/index.js";

export class VoiceGenerator {
  private client: ElevenLabsClient;
  private voiceId: string;

  constructor(apiKey: string, voiceId: string) {
    this.client = new ElevenLabsClient({ apiKey });
    this.voiceId = voiceId;
  }

  async generateNarration(
    text: string,
    outputPath: string
  ): Promise<AudioSegment> {
    return retry(
      async () => {
        const audioStream = await this.client.textToSpeech.convert(
          this.voiceId,
          {
            text,
            model_id: CONFIG.ELEVENLABS_MODEL,
            output_format: CONFIG.AUDIO_FORMAT,
          }
        );

        // Collect stream into buffer
        const chunks: Buffer[] = [];
        for await (const chunk of audioStream) {
          chunks.push(Buffer.from(chunk));
        }
        const audioBuffer = Buffer.concat(chunks);
        await writeFile(outputPath, audioBuffer);

        // Detect duration
        const durationSeconds = await getAudioDuration(outputPath);

        return { filePath: outputPath, durationSeconds, text };
      },
      { maxAttempts: 3, delayMs: 2000, label: "Voice generation" }
    );
  }

  async generateAllNarrations(
    steps: TutorialStep[],
    workDir: string
  ): Promise<AudioSegment[]> {
    const segments: AudioSegment[] = [];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const outputPath = fileManager.audioPath(workDir, i);

      logger.info(
        `  Generating narration ${i + 1}/${steps.length}: "${step.title}"`
      );
      const segment = await this.generateNarration(
        step.narrationText,
        outputPath
      );
      logger.info(`  Duration: ${segment.durationSeconds.toFixed(1)}s`);

      segments.push(segment);
    }

    return segments;
  }
}
