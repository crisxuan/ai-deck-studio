import type { ComparisonSide, ComparisonSlide } from "../core/schema.js";
import { escapeHtml, pointsList, titleBlock } from "./shared.js";

export function renderComparison(slide: ComparisonSlide): string {
  return `
    <div class="comparison-layout">
      ${titleBlock(slide.title, slide.subtitle)}
      <div class="comparison-grid">
        ${renderSide(slide.left, "comparison-left")}
        ${renderSide(slide.right, "comparison-right")}
      </div>
    </div>
  `;
}

function renderSide(side: ComparisonSide, className: string): string {
  return `
    <section class="comparison-side ${className}">
      <p class="comparison-label">${escapeHtml(side.label)}</p>
      ${side.headline ? `<h2>${escapeHtml(side.headline)}</h2>` : ""}
      ${pointsList(side.points)}
    </section>
  `;
}
