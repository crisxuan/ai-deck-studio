import path from "node:path";
import { exportPdf } from "./exportPdf.js";
import { exportPng } from "./exportPng.js";
import { exportPptx } from "./exportPptx.js";

export type ExportFormat = "pdf" | "png" | "pptx";

export type ExportDeckOptions = {
  format: ExportFormat;
  output?: string;
};

export async function exportDeck(htmlPathOrUrl: string, options: ExportDeckOptions): Promise<string[]> {
  const artifactParent = defaultArtifactParent(htmlPathOrUrl);

  if (options.format === "pdf") {
    const outputPath = options.output ?? path.join(artifactParent, "deck.pdf");
    return [await exportPdf(htmlPathOrUrl, { outputPath })];
  }

  if (options.format === "pptx") {
    const outputPath = options.output ?? path.join(artifactParent, "deck.pptx");
    return [await exportPptx(htmlPathOrUrl, { outputPath })];
  }

  const outputDir = options.output ?? path.join(artifactParent, "png");
  return exportPng(htmlPathOrUrl, { outputDir });
}

function defaultArtifactParent(input: string): string {
  if (/^https?:\/\//.test(input)) {
    return path.resolve("output");
  }

  const normalized = input.startsWith("file://") ? new URL(input).pathname : input;
  return path.dirname(path.resolve(normalized));
}
