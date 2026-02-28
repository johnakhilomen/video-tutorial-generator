import chalk from "chalk";
import ora, { type Ora } from "ora";

export const logger = {
  info(message: string) {
    console.log(chalk.blue("ℹ"), message);
  },

  success(message: string) {
    console.log(chalk.green("✓"), message);
  },

  warn(message: string) {
    console.log(chalk.yellow("⚠"), message);
  },

  error(message: string, err?: unknown) {
    console.error(chalk.red("✗"), message);
    if (err instanceof Error) {
      console.error(chalk.dim(err.stack ?? err.message));
    }
  },

  step(stage: number, total: number, message: string) {
    console.log(chalk.cyan(`[${stage}/${total}]`), message);
  },

  spinner(message: string): Ora {
    return ora({ text: message, color: "cyan" }).start();
  },

  progress(label: string, percent: number) {
    const filled = Math.round(percent * 30);
    const bar = "█".repeat(filled) + "░".repeat(30 - filled);
    process.stdout.write(`\r${chalk.cyan(label)} ${bar} ${(percent * 100).toFixed(1)}%`);
    if (percent >= 1) process.stdout.write("\n");
  },
};
