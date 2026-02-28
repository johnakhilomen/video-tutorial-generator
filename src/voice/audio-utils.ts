import { parseFile } from "music-metadata";

export async function getAudioDuration(filePath: string): Promise<number> {
  const metadata = await parseFile(filePath);
  return metadata.format.duration ?? 0;
}
