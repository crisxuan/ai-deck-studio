import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Page } from "playwright";

export function toBrowserUrl(input: string): string {
  if (/^https?:\/\//.test(input) || input.startsWith("file://")) {
    return input;
  }

  return pathToFileURL(path.resolve(input)).toString();
}

export async function captureActiveSlide(page: Page, screenshotPath: string): Promise<void> {
  await fs.mkdir(path.dirname(screenshotPath), { recursive: true });
  await page.screenshot({
    path: screenshotPath,
    fullPage: false
  });
}

export function slideScreenshotPath(outputDir: string, index: number): string {
  return path.join(outputDir, "screenshots", `slide-${String(index + 1).padStart(2, "0")}.png`);
}
