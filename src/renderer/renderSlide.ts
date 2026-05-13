import type { DeckSpec, SlideSpec } from "../core/schema.js";
import { renderAgenda } from "../layouts/agenda.js";
import { renderClosing } from "../layouts/closing.js";
import { renderCode } from "../layouts/code.js";
import { renderComparison } from "../layouts/comparison.js";
import {
  renderDataStory,
  renderFinalAsk,
  renderHeroStatement,
  renderMarketMap,
  renderNarrativeOpener,
  renderProductShowcase,
  renderQuoteBreak,
  renderSystemArchitecture,
  renderTensionResolution
} from "../layouts/compositions.js";
import { renderCover } from "../layouts/cover.js";
import { renderKeyInsight } from "../layouts/keyInsight.js";
import { renderMetricGrid } from "../layouts/metricGrid.js";
import { renderSection } from "../layouts/section.js";
import { escapeHtml } from "../layouts/shared.js";
import { renderTimeline } from "../layouts/timeline.js";
import { renderTwoColumn } from "../layouts/twoColumn.js";

export function renderSlide(slide: SlideSpec, deck: DeckSpec, index: number): string {
  const body = renderSlideBody(slide, deck);
  const notes = slide.presenterNotes
    ? `<aside class="speaker-notes" data-notes-for="${escapeHtml(slide.id)}">${escapeHtml(slide.presenterNotes)}</aside>`
    : "";

  return `
    <section class="slide" data-slide-index="${index}" data-slide-id="${escapeHtml(slide.id)}" data-slide-type="${slide.type}" aria-label="${escapeHtml(slideLabel(slide, index))}">
      <div class="slide-canvas layout-${slide.type}">
        ${body}
      </div>
      ${notes}
    </section>
  `;
}

function renderSlideBody(slide: SlideSpec, deck: DeckSpec): string {
  switch (slide.type) {
    case "cover":
      return renderCover(slide, deck);
    case "agenda":
      return renderAgenda(slide);
    case "section":
      return renderSection(slide);
    case "key-insight":
      return renderKeyInsight(slide);
    case "two-column":
      return renderTwoColumn(slide);
    case "comparison":
      return renderComparison(slide);
    case "timeline":
      return renderTimeline(slide);
    case "metric-grid":
      return renderMetricGrid(slide);
    case "code":
      return renderCode(slide);
    case "closing":
      return renderClosing(slide);
    case "narrative-opener":
      return renderNarrativeOpener(slide);
    case "hero-statement":
      return renderHeroStatement(slide);
    case "product-showcase":
      return renderProductShowcase(slide);
    case "market-map":
      return renderMarketMap(slide);
    case "system-architecture":
      return renderSystemArchitecture(slide);
    case "data-story":
      return renderDataStory(slide);
    case "tension-resolution":
      return renderTensionResolution(slide);
    case "quote-break":
      return renderQuoteBreak(slide);
    case "final-ask":
      return renderFinalAsk(slide);
  }
}

function slideLabel(slide: SlideSpec, index: number): string {
  if ("title" in slide) {
    return slide.title;
  }

  if ("headline" in slide) {
    return slide.headline;
  }

  return `Slide ${index + 1}`;
}
