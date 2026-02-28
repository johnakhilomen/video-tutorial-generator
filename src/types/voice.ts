export interface VoiceConfig {
  apiKey: string;
  voiceId: string;
  modelId: string;
}

export interface AudioSegment {
  filePath: string;
  durationSeconds: number;
  text: string;
}
