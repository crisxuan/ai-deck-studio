import type { CoverSlide, DeckSpec } from "../core/schema.js";
import { escapeHtml, eyebrow, optionalText } from "./shared.js";

export function renderCover(slide: CoverSlide, deck: DeckSpec): string {
  const meta = slide.meta ?? deck.audience;

  return `
    <div class="cover-layout">
      <div class="cover-copy">
        ${eyebrow(slide.eyebrow ?? deck.tone)}
        <h1>${escapeHtml(slide.title)}</h1>
        ${optionalText("cover-subtitle", slide.subtitle)}
      </div>
      <div class="cover-meta">
        <span>${escapeHtml(meta)}</span>
        <span>${escapeHtml(deck.version)}</span>
      </div>
    </div>
  `;
}
