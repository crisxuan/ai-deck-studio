import { normalizeDeck } from "../core/normalize.js";
import type { DeckSpec } from "../core/schema.js";
import { htmlShell } from "./htmlShell.js";
import { renderSlide } from "./renderSlide.js";

export async function renderDeck(deck: DeckSpec): Promise<string> {
  const normalized = normalizeDeck(deck);
  const slides = normalized.slides.map((slide, index) => renderSlide(slide, normalized, index)).join("\n");

  return htmlShell(normalized, slides);
}
