import type { ClosingSlide } from "../core/schema.js";
import { escapeHtml, optionalText, pointsList } from "./shared.js";

export function renderClosing(slide: ClosingSlide): string {
  return `
    <div class="closing-layout">
      <div>
        <h1>${escapeHtml(slide.title)}</h1>
        ${optionalText("closing-subtitle", slide.subtitle)}
        ${optionalText("closing-takeaway", slide.takeaway)}
      </div>
      <div class="closing-actions">
        ${pointsList(slide.nextSteps, "next-steps")}
        ${slide.contact ? `<p class="contact">${escapeHtml(slide.contact)}</p>` : ""}
      </div>
    </div>
  `;
}
