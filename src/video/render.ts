import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import { CONFIG } from "../config.js";
import { logger } from "../utils/logger.js";
import type { VideoCompositionProps } from "../types/index.js";

export async function renderTutorialVideo(
  props: VideoCompositionProps,
  outputPath: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const spinner = logger.spinner("Bundling Remotion project...");

  try {
    // Bundle the Remotion project
    const entryPoint = path.resolve(
      import.meta.dirname,
      "./entry.tsx"
    );

    const publicDir = path.resolve(import.meta.dirname, "./public");

    const bundleLocation = await bundle({
      entryPoint,
      publicDir,
      webpackOverride: (config) => ({
        ...config,
        resolve: {
          ...config.resolve,
          extensions: [".tsx", ".ts", ".jsx", ".js", ".mjs", ".json"],
          extensionAlias: {
            ".js": [".tsx", ".ts", ".js"],
          },
        },
      }),
    });

    spinner.text = "Selecting composition...";

    // Select the composition with calculated metadata
    const composition = await selectComposition({
      serveUrl: bundleLocation,
      id: "TutorialVideo",
      inputProps: props as unknown as Record<string, unknown>,
    });

    spinner.succeed("Remotion bundle ready");
    logger.info(
      `Rendering ${composition.durationInFrames} frames at ${CONFIG.OUTPUT_WIDTH}x${CONFIG.OUTPUT_HEIGHT}...`
    );

    // Render to MP4
    await renderMedia({
      composition,
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation: outputPath,
      inputProps: props as unknown as Record<string, unknown>,
      imageFormat: "jpeg",
      jpegQuality: CONFIG.JPEG_QUALITY,
      concurrency: CONFIG.RENDER_CONCURRENCY,
      onProgress: ({ progress }) => {
        onProgress?.(progress);
      },
    });

    logger.success(`Video rendered: ${outputPath}`);
    return outputPath;
  } catch (err) {
    spinner.fail("Rendering failed");
    throw err;
  }
}
