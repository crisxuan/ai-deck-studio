import type {
  ArchitectureLayer,
  DataStorySlide,
  FeatureCard,
  FinalAskSlide,
  HeroStatementSlide,
  MarketMapSlide,
  MarketSegment,
  MiniMetric,
  NarrativeOpenerSlide,
  ProductShowcaseSlide,
  QuoteBreakSlide,
  SystemArchitectureSlide,
  TensionResolutionSlide
} from "../core/schema.js";
import { escapeHtml, eyebrow, pointsList, titleBlock } from "./shared.js";

export function renderNarrativeOpener(slide: NarrativeOpenerSlide): string {
  return `
    <div class="composition narrative-opener-layout">
      <div class="keynote-ambient" aria-hidden="true"></div>
      <div class="narrative-copy">
        ${eyebrow(slide.eyebrow)}
        <h1>${escapeHtml(slide.title)}</h1>
        ${slide.subtitle ? `<p class="composition-subtitle">${escapeHtml(slide.subtitle)}</p>` : ""}
        ${renderChips(slide.chips)}
      </div>
      ${slide.stat ? renderSpotlightMetric(slide.stat) : ""}
    </div>
  `;
}

export function renderHeroStatement(slide: HeroStatementSlide): string {
  return `
    <div class="composition hero-statement-layout">
      <div class="hero-statement-copy">
        ${eyebrow(slide.eyebrow)}
        <h1>${escapeHtml(slide.headline)}</h1>
        ${slide.subheadline ? `<p class="composition-subtitle">${escapeHtml(slide.subheadline)}</p>` : ""}
      </div>
      ${slide.proofs?.length ? `<div class="proof-strip">${slide.proofs.map(renderProof).join("")}</div>` : ""}
    </div>
  `;
}

export function renderProductShowcase(slide: ProductShowcaseSlide): string {
  return `
    <div class="composition product-showcase-layout">
      ${titleBlock(slide.title, slide.subtitle)}
      <div class="product-showcase-stage">
        <div class="product-device" aria-label="${escapeHtml(slide.productName)} product preview">
          <div class="device-topbar"><span></span><span></span><span></span></div>
          <div class="device-hero">
            <p>${escapeHtml(slide.productName)}</p>
            <strong>${escapeHtml(slide.tagline ?? "Intelligent workflow command center")}</strong>
          </div>
          <div class="device-grid">
            <span></span><span></span><span></span><span></span>
          </div>
        </div>
        <div class="product-feature-stack">
          ${slide.features.map(renderFeatureCard).join("")}
          ${slide.metrics?.length ? `<div class="product-metrics">${slide.metrics.map(renderCompactMetric).join("")}</div>` : ""}
        </div>
      </div>
    </div>
  `;
}

export function renderMarketMap(slide: MarketMapSlide): string {
  return `
    <div class="composition market-map-layout">
      ${titleBlock(slide.title, slide.subtitle)}
      <div class="market-map">
        ${slide.segments.map(renderMarketSegment).join("")}
      </div>
      ${slide.insight ? `<p class="map-insight">${escapeHtml(slide.insight)}</p>` : ""}
    </div>
  `;
}

export function renderSystemArchitecture(slide: SystemArchitectureSlide): string {
  return `
    <div class="composition system-architecture-layout">
      ${titleBlock(slide.title, slide.subtitle)}
      <div class="architecture-stack">
        ${slide.layers.map(renderArchitectureLayer).join("")}
      </div>
      ${slide.callout ? `<p class="architecture-callout">${escapeHtml(slide.callout)}</p>` : ""}
    </div>
  `;
}

export function renderDataStory(slide: DataStorySlide): string {
  return `
    <div class="composition data-story-layout">
      <div class="data-story-copy">
        ${titleBlock(slide.title, slide.subtitle)}
        <h2>${escapeHtml(slide.headline)}</h2>
        ${slide.takeaway ? `<p class="data-takeaway">${escapeHtml(slide.takeaway)}</p>` : ""}
      </div>
      <div class="data-dashboard">
        ${slide.metrics.map(renderDataMetric).join("")}
      </div>
    </div>
  `;
}

export function renderTensionResolution(slide: TensionResolutionSlide): string {
  return `
    <div class="composition tension-resolution-layout">
      ${titleBlock(slide.title, slide.subtitle)}
      <div class="tension-grid">
        <section class="tension-card is-tension">
          <p class="comparison-label">${escapeHtml(slide.tension.label)}</p>
          ${slide.tension.headline ? `<h2>${escapeHtml(slide.tension.headline)}</h2>` : ""}
          ${pointsList(slide.tension.points)}
        </section>
        <div class="resolution-arrow" aria-hidden="true">→</div>
        <section class="tension-card is-resolution">
          <p class="comparison-label">${escapeHtml(slide.resolution.label)}</p>
          ${slide.resolution.headline ? `<h2>${escapeHtml(slide.resolution.headline)}</h2>` : ""}
          ${pointsList(slide.resolution.points)}
        </section>
      </div>
    </div>
  `;
}

export function renderQuoteBreak(slide: QuoteBreakSlide): string {
  return `
    <div class="composition quote-break-layout">
      ${eyebrow(slide.eyebrow)}
      <blockquote>${escapeHtml(slide.quote)}</blockquote>
      ${slide.attribution ? `<p class="quote-attribution">${escapeHtml(slide.attribution)}</p>` : ""}
      ${slide.context ? `<p class="quote-context">${escapeHtml(slide.context)}</p>` : ""}
    </div>
  `;
}

export function renderFinalAsk(slide: FinalAskSlide): string {
  return `
    <div class="composition final-ask-layout">
      <div class="final-copy">
        <h1>${escapeHtml(slide.title)}</h1>
        ${slide.subtitle ? `<p class="composition-subtitle">${escapeHtml(slide.subtitle)}</p>` : ""}
      </div>
      <div class="ask-panel">
        <p class="ask-label">The ask</p>
        <strong>${escapeHtml(slide.ask)}</strong>
        ${slide.actions?.length ? pointsList(slide.actions, "next-steps") : ""}
        ${slide.contact ? `<p class="contact">${escapeHtml(slide.contact)}</p>` : ""}
      </div>
    </div>
  `;
}

function renderChips(chips?: string[]): string {
  if (!chips?.length) {
    return "";
  }

  return `<div class="chip-row">${chips.map((chip) => `<span>${escapeHtml(chip)}</span>`).join("")}</div>`;
}

function renderSpotlightMetric(metric: MiniMetric): string {
  return `
    <aside class="spotlight-metric">
      <p>${escapeHtml(metric.label)}</p>
      <strong>${escapeHtml(metric.value)}</strong>
      ${metric.detail ? `<span>${escapeHtml(metric.detail)}</span>` : ""}
    </aside>
  `;
}

function renderProof(metric: MiniMetric): string {
  return `
    <article>
      <p>${escapeHtml(metric.label)}</p>
      <strong>${escapeHtml(metric.value)}</strong>
      ${metric.detail ? `<span>${escapeHtml(metric.detail)}</span>` : ""}
    </article>
  `;
}

function renderFeatureCard(feature: FeatureCard): string {
  return `
    <article class="showcase-feature">
      <h2>${escapeHtml(feature.title)}</h2>
      <p>${escapeHtml(feature.description)}</p>
    </article>
  `;
}

function renderCompactMetric(metric: MiniMetric): string {
  return `
    <article>
      <strong>${escapeHtml(metric.value)}</strong>
      <p>${escapeHtml(metric.label)}</p>
    </article>
  `;
}

function renderMarketSegment(segment: MarketSegment): string {
  return `
    <article class="market-segment">
      ${segment.signal ? `<span>${escapeHtml(segment.signal)}</span>` : ""}
      <h2>${escapeHtml(segment.label)}</h2>
      <p>${escapeHtml(segment.description)}</p>
    </article>
  `;
}

function renderArchitectureLayer(layer: ArchitectureLayer): string {
  return `
    <article class="architecture-layer">
      <div>
        <h2>${escapeHtml(layer.label)}</h2>
        <p>${escapeHtml(layer.description)}</p>
      </div>
      ${layer.tools?.length ? `<div class="tool-row">${layer.tools.map((tool) => `<span>${escapeHtml(tool)}</span>`).join("")}</div>` : ""}
    </article>
  `;
}

function renderDataMetric(metric: MiniMetric): string {
  return `
    <article class="data-metric">
      <p>${escapeHtml(metric.label)}</p>
      <strong>${escapeHtml(metric.value)}</strong>
      ${metric.detail ? `<span>${escapeHtml(metric.detail)}</span>` : ""}
    </article>
  `;
}
