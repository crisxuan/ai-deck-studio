import type { Metric, MetricGridSlide } from "../core/schema.js";
import { escapeHtml, titleBlock } from "./shared.js";

export function renderMetricGrid(slide: MetricGridSlide): string {
  return `
    <div class="metric-grid-layout">
      ${titleBlock(slide.title, slide.subtitle)}
      <div class="metric-grid">
        ${slide.metrics.map(renderMetric).join("")}
      </div>
    </div>
  `;
}

function renderMetric(metric: Metric): string {
  return `
    <article class="metric-tile">
      <p>${escapeHtml(metric.label)}</p>
      <strong>${escapeHtml(metric.value)}</strong>
      ${metric.detail ? `<span>${escapeHtml(metric.detail)}</span>` : ""}
    </article>
  `;
}
