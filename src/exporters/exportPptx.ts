import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import pptxgen from "pptxgenjs";
import { exportPng } from "./exportPng.js";

export type ExportPptxOptions = {
  outputPath: string;
};

export async function exportPptx(htmlPathOrUrl: string, options: ExportPptxOptions): Promise<string> {
  await fs.mkdir(path.dirname(options.outputPath), { recursive: true });

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "ai-deck-pptx-"));

  try {
    const pngPaths = await exportPng(htmlPathOrUrl, { outputDir: tempDir });

    if (!pngPaths.length) {
      throw new Error("Cannot export PPTX because no slides were rendered.");
    }

    const { width, height } = await readPngSize(pngPaths[0]);
    const layout = pptxLayoutFromPixels(width, height);
    const PptxGenJS = ((pptxgen as any).default ?? pptxgen) as { new (): any };
    const pptx = new PptxGenJS();

    pptx.author = "AI Deck Studio";
    pptx.subject = "Image-based export generated from an AI Deck Studio HTML deck.";
    pptx.title = path.basename(options.outputPath, path.extname(options.outputPath));
    pptx.company = "AI Deck Studio";
    pptx.defineLayout({ name: "AI_DECK", width: layout.width, height: layout.height });
    pptx.layout = "AI_DECK";
    pptx.theme = {
      headFontFace: "Aptos Display",
      bodyFontFace: "Aptos",
      lang: "en-US"
    };

    for (const pngPath of pngPaths) {
      const slide = pptx.addSlide();
      slide.background = { color: "FFFFFF" };
      slide.addImage({
        path: pngPath,
        x: 0,
        y: 0,
        w: layout.width,
        h: layout.height
      });
    }

    await pptx.writeFile({ fileName: options.outputPath });
    return options.outputPath;
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

async function readPngSize(filePath: string): Promise<{ width: number; height: number }> {
  const file = await fs.readFile(filePath);

  if (file.length < 24 || file.toString("ascii", 1, 4) !== "PNG") {
    throw new Error(`Expected PNG screenshot at ${filePath}`);
  }

  return {
    width: file.readUInt32BE(16),
    height: file.readUInt32BE(20)
  };
}

function pptxLayoutFromPixels(width: number, height: number): { width: number; height: number } {
  const ratio = width / height;

  if (Math.abs(ratio - 16 / 9) < 0.04) {
    return { width: 13.333, height: 7.5 };
  }

  if (Math.abs(ratio - 4 / 3) < 0.04) {
    return { width: 10, height: 7.5 };
  }

  if (Math.abs(ratio - 3 / 4) < 0.04) {
    return { width: 7.5, height: 10 };
  }

  return { width: 10, height: Number((10 / ratio).toFixed(3)) };
}
