import { logger } from "./logger.js";

export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    backoffMultiplier?: number;
    label?: string;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
    label = "operation",
  } = options;

  let lastError: unknown;
  let currentDelay = delayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        logger.warn(
          `${label} failed (attempt ${attempt}/${maxAttempts}), retrying in ${currentDelay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, currentDelay));
        currentDelay *= backoffMultiplier;
      }
    }
  }

  throw lastError;
}
