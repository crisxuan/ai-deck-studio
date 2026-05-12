import type { AgendaSlide } from "../core/schema.js";
import { numberList, titleBlock } from "./shared.js";

export function renderAgenda(slide: AgendaSlide): string {
  return `
    <div class="agenda-layout">
      ${titleBlock(slide.title, slide.subtitle)}
      <div class="agenda-list-wrap">
        ${numberList(slide.items, "agenda-list")}
      </div>
    </div>
  `;
}
