import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { DeckSpec } from "../core/schema.js";
import { escapeHtml } from "../layouts/shared.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export async function htmlShell(deck: DeckSpec, slidesHtml: string): Promise<string> {
  const css = await loadTextAsset("themes", "base.css");
  const themeCss = await loadTextAsset("themes", `${deck.theme}.css`);
  const runtime = await loadTextAsset("runtime", "deck-runtime.js");
  const story = deck.story
    ? `<script type="application/json" id="deck-story">${escapeHtml(JSON.stringify(deck.story))}</script>`
    : "";
  const languageSwitcher = renderLanguageSwitcher(deck);

  return `<!doctype html>
<html lang="${escapeHtml(deck.language ?? "en")}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(deck.title)}</title>
  <style>
${css}
${themeCss}
  </style>
</head>
<body class="theme-${deck.theme}" data-aspect-ratio="${deck.aspectRatio}" data-slide-count="${deck.slides.length}">
  <main class="deck-root" aria-label="${escapeHtml(deck.title)}">
    ${slidesHtml}
  </main>
  <nav class="deck-chrome" aria-label="Deck navigation">
    <button type="button" data-deck-prev aria-label="Previous slide">&lsaquo;</button>
    <span data-deck-progress>1 / ${deck.slides.length}</span>
    <button type="button" data-deck-next aria-label="Next slide">&rsaquo;</button>
  </nav>
  ${languageSwitcher}
  ${story}
  <script>
${runtime}
  </script>
</body>
</html>`;
}

function renderLanguageSwitcher(deck: DeckSpec): string {
  if (!deck.alternates?.length) {
    return "";
  }

  const current = deck.language ? `<span class="is-current">${escapeHtml(languageLabel(deck.language))}</span>` : "";
  const links = deck.alternates
    .map((alternate) => {
      const lang = alternate.language ? ` lang="${escapeHtml(alternate.language)}"` : "";
      return `<a href="${escapeHtml(alternate.href)}"${lang}>${escapeHtml(alternate.label)}</a>`;
    })
    .join("");

  return `<nav class="language-switcher" aria-label="Language switcher">${current}${links}</nav>`;
}

function languageLabel(language: string): string {
  if (language.toLowerCase().startsWith("zh")) {
    return "中文";
  }

  if (language.toLowerCase().startsWith("en")) {
    return "EN";
  }

  return language;
}

async function loadTextAsset(folder: string, fileName: string): Promise<string> {
  const candidates = [
    path.resolve(process.cwd(), "src", folder, fileName),
    path.resolve(currentDir, "..", folder, fileName),
    path.resolve(currentDir, "..", "..", "src", folder, fileName)
  ];

  for (const candidate of candidates) {
    try {
      return await fs.readFile(candidate, "utf8");
    } catch {
      // Continue trying known source and build output locations.
    }
  }

  throw new Error(`Unable to locate asset ${folder}/${fileName}`);
}
