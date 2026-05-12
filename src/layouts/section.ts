import type { SectionSlide } from "../core/schema.js";
import { escapeHtml, eyebrow, optionalText } from "./shared.js";

export function renderSection(slide: SectionSlide): string {
  return `
    <div class="section-layout">
      ${eyebrow(slide.eyebrow)}
      <h1>${escapeHtml(slide.title)}</h1>
      ${optionalText("section-kicker", slide.kicker)}
    </div>
  `;
}
