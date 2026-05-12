import type { TimelineEvent, TimelineSlide } from "../core/schema.js";
import { escapeHtml, titleBlock } from "./shared.js";

export function renderTimeline(slide: TimelineSlide): string {
  return `
    <div class="timeline-layout">
      ${titleBlock(slide.title, slide.subtitle)}
      <div class="timeline-track">
        ${slide.events.map(renderEvent).join("")}
      </div>
    </div>
  `;
}

function renderEvent(event: TimelineEvent): string {
  return `
    <article class="timeline-event">
      <p class="timeline-label">${escapeHtml(event.label)}</p>
      <h2>${escapeHtml(event.title)}</h2>
      ${event.description ? `<p>${escapeHtml(event.description)}</p>` : ""}
    </article>
  `;
}
