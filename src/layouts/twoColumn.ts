import type { TextColumn, TwoColumnSlide } from "../core/schema.js";
import { escapeHtml, optionalText, pointsList, titleBlock } from "./shared.js";

export function renderTwoColumn(slide: TwoColumnSlide): string {
  return `
    <div class="two-column-layout">
      ${titleBlock(slide.title, slide.subtitle)}
      <div class="column-grid">
        ${slide.columns.map(renderColumn).join("")}
      </div>
    </div>
  `;
}

function renderColumn(column: TextColumn): string {
  return `
    <section class="content-panel">
      <h2>${escapeHtml(column.heading)}</h2>
      ${optionalText("panel-body", column.body)}
      ${pointsList(column.points)}
    </section>
  `;
}
