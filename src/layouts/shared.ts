export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function optionalText(className: string, value?: string): string {
  return value ? `<p class="${className}">${escapeHtml(value)}</p>` : "";
}

export function eyebrow(value?: string): string {
  return value ? `<p class="eyebrow">${escapeHtml(value)}</p>` : "";
}

export function pointsList(points?: string[], className = "point-list"): string {
  if (!points?.length) {
    return "";
  }

  return `<ul class="${className}">${points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>`;
}

export function numberList(items: string[], className = "number-list"): string {
  return `<ol class="${className}">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>`;
}

export function titleBlock(title: string, subtitle?: string): string {
  return `<header class="slide-header"><h1>${escapeHtml(title)}</h1>${optionalText("slide-subtitle", subtitle)}</header>`;
}
