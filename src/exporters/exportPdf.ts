import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { pdfPageSize } from "../core/normalize.js";
import type { AspectRatio } from "../core/schema.js";
import { toBrowserUrl } from "../verifier/screenshot.js";

export type ExportPdfOptions = {
  outputPath: string;
};

export async function exportPdf(htmlPathOrUrl: string, options: ExportPdfOptions): Promise<string> {
  await fs.mkdir(path.dirname(options.outputPath), { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });

  try {
    await page.goto(withPrintMode(toBrowserUrl(htmlPathOrUrl)), { waitUntil: "networkidle" });
    const aspectRatio = (await page.evaluate(() => document.body.dataset.aspectRatio ?? "16:9")) as AspectRatio;
    const size = pdfPageSize(aspectRatio);

    await page.pdf({
      path: options.outputPath,
      printBackground: true,
      width: size.width,
      height: size.height,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      preferCSSPageSize: false
    });

    return options.outputPath;
  } finally {
    await browser.close();
  }
}

function withPrintMode(url: string): string {
  const parsed = new URL(url);
  parsed.searchParams.set("print", "1");
  return parsed.toString();
}
