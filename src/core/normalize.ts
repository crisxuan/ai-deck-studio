import path from "node:path";
import type { AspectRatio, DeckSpec } from "./schema.js";

export function normalizeDeck(deck: DeckSpec): DeckSpec {
  return {
    ...deck,
    aspectRatio: deck.aspectRatio ?? "16:9",
    language: deck.language ?? "en",
    slides: deck.slides.map((slide, index) => ({
      ...slide,
      id: slide.id || `slide-${index + 1}`
    }))
  };
}

export function defaultOutputDir(deckPath: string): string {
  return path.join(path.dirname(path.resolve(deckPath)), "output");
}

export function ratioToNumber(aspectRatio: AspectRatio): number {
  const [width, height] = aspectRatio.split(":").map(Number);
  return width / height;
}

export function pdfPageSize(aspectRatio: AspectRatio): { width: string; height: string } {
  if (aspectRatio === "3:4") {
    return { width: "7.5in", height: "10in" };
  }

  if (aspectRatio === "4:3") {
    return { width: "10in", height: "7.5in" };
  }

  return { width: "13.333in", height: "7.5in" };
}
