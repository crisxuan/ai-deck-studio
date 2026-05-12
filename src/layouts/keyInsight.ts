import type { KeyInsightSlide } from "../core/schema.js";
import { escapeHtml, eyebrow, optionalText, pointsList } from "./shared.js";

export function renderKeyInsight(slide: KeyInsightSlide): string {
  return `
    <div class="key-insight-layout">
      <div class="insight-main">
        ${eyebrow(slide.eyebrow)}
        <h1>${escapeHtml(slide.headline)}</h1>
        ${optionalText("evidence", slide.evidence)}
      </div>
      <aside class="insight-points">
        ${pointsList(slide.points)}
      </aside>
    </div>
  `;
}
