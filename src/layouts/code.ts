import type { CodeSlide } from "../core/schema.js";
import { escapeHtml, optionalText, titleBlock } from "./shared.js";

export function renderCode(slide: CodeSlide): string {
  return `
    <div class="code-layout">
      ${titleBlock(slide.title, slide.subtitle)}
      <div class="code-window">
        <div class="code-window-bar">
          <span></span><span></span><span></span>
          <p>${escapeHtml(slide.language ?? "code")}</p>
        </div>
        <pre><code>${escapeHtml(slide.code)}</code></pre>
      </div>
      ${optionalText("code-caption", slide.caption)}
    </div>
  `;
}
