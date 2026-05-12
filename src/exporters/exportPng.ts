import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { captureActiveSlide, toBrowserUrl } from "../verifier/screenshot.js";

export type ExportPngOptions = {
  outputDir: string;
};

export async function exportPng(htmlPathOrUrl: string, options: ExportPngOptions): Promise<string[]> {
  await fs.mkdir(options.outputDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });

  try {
    await page.goto(toBrowserUrl(htmlPathOrUrl), { waitUntil: "networkidle" });
    await adjustViewportForAspectRatio(page);

    const slideCount = await page.evaluate(() => document.querySelectorAll(".slide").length);
    const paths: string[] = [];

    for (let index = 0; index < slideCount; index += 1) {
      await page.evaluate((slideIndex) => {
        (window as unknown as { DeckRuntime?: { goTo: (index: number, options?: { silent?: boolean }) => void } }).DeckRuntime?.goTo(slideIndex, {
          silent: true
        });
      }, index);
      await page.waitForTimeout(240);

      const screenshotPath = path.join(options.outputDir, `slide-${String(index + 1).padStart(2, "0")}.png`);
      await captureActiveSlide(page, screenshotPath);
      paths.push(screenshotPath);
    }

    return paths;
  } finally {
    await browser.close();
  }
}

async function adjustViewportForAspectRatio(page: import("playwright").Page): Promise<void> {
  const aspectRatio = await page.evaluate(() => document.body.dataset.aspectRatio ?? "16:9");

  if (aspectRatio === "3:4") {
    await page.setViewportSize({ width: 1200, height: 1600 });
  } else if (aspectRatio === "4:3") {
    await page.setViewportSize({ width: 1400, height: 1050 });
  }
}
