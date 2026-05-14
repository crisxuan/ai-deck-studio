import fs from "node:fs/promises";
import path from "node:path";
import { defaultOutputDir } from "../src/core/normalize.js";
import { THEMES, type DeckSpec } from "../src/core/schema.js";
import { readDeck, validateDeck } from "../src/core/validate.js";
import { renderDeck } from "../src/renderer/renderDeck.js";

type ShowcaseDeck = {
  id: string;
  deckPath: string;
  outputPath: string;
  href: string;
  previewHref: string;
  title: string;
  goal: string;
  tone?: string;
  theme: DeckSpec["theme"];
  aspectRatio: DeckSpec["aspectRatio"];
  language?: string;
  slideCount: number;
};

const rootDir = process.cwd();
const examplesDir = path.join(rootDir, "examples");
const showcaseDir = path.join(rootDir, "showcase");
const showcasePath = path.join(showcaseDir, "index.html");

async function main(): Promise<void> {
  const decks = await renderExamples();
  const themeDecks = await renderThemePreviews();
  await fs.mkdir(showcaseDir, { recursive: true });
  await fs.writeFile(showcasePath, renderShowcase(decks, themeDecks));
  console.log(`Rendered ${decks.length} examples.`);
  console.log(`Rendered ${themeDecks.length} theme previews.`);
  console.log(`Generated ${showcasePath}`);
}

async function renderExamples(): Promise<ShowcaseDeck[]> {
  const entries = await fs.readdir(examplesDir, { withFileTypes: true });
  const deckPaths = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(examplesDir, entry.name, "deck.json"))
    .sort();
  const decks: ShowcaseDeck[] = [];

  for (const deckPath of deckPaths) {
    if (!(await exists(deckPath))) {
      continue;
    }

    const deck = await readDeck(deckPath);
    const validation = await validateDeck(deck);

    if (!validation.ok) {
      const errors = validation.errors.map((error) => `${error.path}: ${error.message}`).join("\n");
      throw new Error(`Invalid deck ${deckPath}\n${errors}`);
    }

    const outputDir = defaultOutputDir(deckPath);
    const outputPath = path.join(outputDir, "index.html");
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(outputPath, await renderDeck(deck));

    const href = relativeHref(showcaseDir, outputPath);
    decks.push({
      id: path.basename(path.dirname(deckPath)),
      deckPath,
      outputPath,
      href,
      previewHref: `${href}?preview=1`,
      title: deck.title,
      goal: deck.goal,
      tone: deck.tone,
      theme: deck.theme,
      aspectRatio: deck.aspectRatio,
      language: deck.language,
      slideCount: deck.slides.length
    });
  }

  return decks;
}

async function renderThemePreviews(): Promise<ShowcaseDeck[]> {
  const sourcePath = (await exists(path.join(examplesDir, "product-launch-zh", "deck.json")))
    ? path.join(examplesDir, "product-launch-zh", "deck.json")
    : path.join(examplesDir, "tech-sharing", "deck.json");
  const sourceDeck = await readDeck(sourcePath);
  const themeDecks: ShowcaseDeck[] = [];

  for (const theme of THEMES) {
    const deck: DeckSpec = {
      ...sourceDeck,
      title: `Theme Preview · ${theme}`,
      goal: `用同一套真实 deck 内容预览 ${theme} 主题的视觉语言。`,
      tone: `TypeUI-inspired ${theme} presentation style`,
      theme,
      language: "zh-CN",
      alternates: undefined
    };
    const outputDir = path.join(showcaseDir, "theme-previews", theme);
    const outputPath = path.join(outputDir, "index.html");
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(outputPath, await renderDeck(deck));

    const href = relativeHref(showcaseDir, outputPath);
    themeDecks.push({
      id: `theme-${theme}`,
      deckPath: sourcePath,
      outputPath,
      href,
      previewHref: `${href}?preview=1`,
      title: deck.title,
      goal: deck.goal,
      tone: deck.tone,
      theme,
      aspectRatio: deck.aspectRatio,
      language: deck.language,
      slideCount: deck.slides.length
    });
  }

  return themeDecks;
}

function renderShowcase(decks: ShowcaseDeck[], themeDecks: ShowcaseDeck[]): string {
  const premiumDecks = decks.filter((deck) =>
    ["technical-blueprint", "founder-editorial", "executive-dashboard"].includes(deck.theme)
  );

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AI Deck Studio Showcase</title>
  <style>
    :root {
      color-scheme: light;
      --page: #edf1f5;
      --ink: #101722;
      --muted: #637083;
      --line: rgba(16, 23, 34, 0.12);
      --panel: rgba(255, 255, 255, 0.82);
      --accent: #2954ff;
      --accent-2: #00a77f;
      --shadow: 0 24px 64px rgba(16, 23, 34, 0.16);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      background:
        linear-gradient(rgba(41, 84, 255, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(41, 84, 255, 0.05) 1px, transparent 1px),
        linear-gradient(180deg, #f8fafc 0%, var(--page) 100%);
      background-size: 42px 42px, 42px 42px, auto;
      color: var(--ink);
    }

    a { color: inherit; }

    .shell {
      width: min(1440px, calc(100vw - 48px));
      margin: 0 auto;
      padding: 48px 0 70px;
    }

    .hero {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 48px;
      align-items: end;
      margin-bottom: 34px;
      padding-bottom: 28px;
      border-bottom: 1px solid var(--line);
    }

    .eyebrow {
      margin: 0 0 12px;
      color: var(--accent);
      font-size: 0.82rem;
      font-weight: 900;
      text-transform: uppercase;
    }

    h1 {
      max-width: 900px;
      margin: 0;
      font-size: clamp(2.7rem, 5.7vw, 5.4rem);
      line-height: 0.98;
      letter-spacing: 0;
    }

    .hero p {
      max-width: 740px;
      margin: 22px 0 0;
      color: var(--muted);
      font-size: 1.16rem;
      line-height: 1.5;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(4, 132px);
      gap: 12px;
    }

    .stat {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
      padding: 16px;
      box-shadow: var(--shadow);
    }

    .stat strong {
      display: block;
      margin-bottom: 6px;
      color: var(--accent);
      font-size: 2.1rem;
      line-height: 1;
    }

    .stat span {
      color: var(--muted);
      font-size: 0.78rem;
      font-weight: 850;
      text-transform: uppercase;
    }

    .section {
      margin-top: 52px;
    }

    .section-head {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 24px;
      margin-bottom: 18px;
    }

    .section h2 {
      margin: 0;
      font-size: 2rem;
      line-height: 1.05;
    }

    .section-head p {
      max-width: 620px;
      margin: 0;
      color: var(--muted);
      line-height: 1.45;
    }

    .deck-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 18px;
    }

    .deck-card,
    .theme-card,
    .runtime-card {
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.86);
      box-shadow: 0 18px 44px rgba(16, 23, 34, 0.1);
    }

    .deck-preview {
      position: relative;
      aspect-ratio: 16 / 9;
      overflow: hidden;
      border-bottom: 1px solid var(--line);
      background: #dbe3ea;
    }

    .deck-preview iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 1280px;
      height: 720px;
      border: 0;
      transform-origin: top left;
      pointer-events: none;
    }

    .deck-body {
      padding: 18px;
    }

    .deck-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
      margin-bottom: 12px;
    }

    .deck-meta span,
    .runtime-card span {
      border: 1px solid rgba(41, 84, 255, 0.2);
      border-radius: 999px;
      background: rgba(41, 84, 255, 0.06);
      color: var(--accent);
      font-size: 0.72rem;
      font-weight: 850;
      padding: 6px 8px;
    }

    .deck-body h3,
    .theme-card h3,
    .runtime-card h3 {
      margin: 0 0 8px;
      font-size: 1.12rem;
      line-height: 1.2;
    }

    .deck-body p,
    .theme-card p,
    .runtime-card p {
      margin: 0;
      color: var(--muted);
      font-size: 0.92rem;
      line-height: 1.42;
    }

    .deck-link {
      display: inline-flex;
      margin-top: 16px;
      border-radius: 999px;
      background: #101722;
      color: #ffffff;
      font-size: 0.82rem;
      font-weight: 850;
      padding: 10px 13px;
      text-decoration: none;
    }

    .theme-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
    }

    .theme-card h3 {
      font-size: 0.98rem;
    }

    .runtime-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
    }

    .runtime-card {
      min-height: 170px;
      padding: 20px;
    }

    .runtime-card span {
      display: inline-flex;
      margin-bottom: 18px;
    }

    code {
      border-radius: 4px;
      background: rgba(16, 23, 34, 0.08);
      padding: 2px 5px;
    }

    @media (max-width: 980px) {
      .hero,
      .deck-grid,
      .theme-grid,
      .runtime-grid {
        grid-template-columns: 1fr;
      }

      .stats {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

    }
  </style>
</head>
<body>
  <main class="shell">
    <section class="hero">
      <div>
        <p class="eyebrow">AI Deck Studio Showcase</p>
        <h1>一眼看完主题、示例和运行时能力。</h1>
        <p>这个页面由 <code>npm run showcase</code> 自动生成：它会先渲染全部示例 deck，再用同一套真实内容生成每个主题的 live preview。打开任意 deck 后按 <code>S</code> 可以进入演讲者模式。</p>
      </div>
      <div class="stats">
        <div class="stat"><strong>${themeDecks.length}</strong><span>Themes</span></div>
        <div class="stat"><strong>${decks.length}</strong><span>Decks</span></div>
        <div class="stat"><strong>${decks.reduce((sum, deck) => sum + deck.slideCount, 0)}</strong><span>Slides</span></div>
        <div class="stat"><strong>3</strong><span>Runtime modes</span></div>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <h2>高级中文 Showcase</h2>
        <p>这几套用于拉开视觉差异：技术架构、投资人路演、经营复盘分别使用独立视觉系统。</p>
      </div>
      <div class="deck-grid">
        ${premiumDecks.map(renderDeckCard).join("")}
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <h2>主题画廊</h2>
        <p>每张卡片都用同一套真实 deck 内容重新渲染，不是静态 mock。主题是否真的不同，可以直接肉眼对比。</p>
      </div>
      <div class="theme-grid">
        ${themeDecks.map(renderThemeCard).join("")}
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <h2>完整示例 Deck</h2>
        <p>用于回归测试、视觉挑选和导出演示。</p>
      </div>
      <div class="deck-grid">
        ${decks.map(renderDeckCard).join("")}
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <h2>运行时能力</h2>
        <p>这版先补可演示的核心交互，后续再把 presenter cards 做成可拖拽、可缩放。</p>
      </div>
      <div class="runtime-grid">
        <article class="runtime-card"><span>S</span><h3>Presenter Mode</h3><p>打开演讲者窗口，包含当前页、下一页、speaker notes、计时器和翻页按钮。</p></article>
        <article class="runtime-card"><span>O</span><h3>Slide Overview</h3><p>快速打开全部页面索引，适合演示时跳转。</p></article>
        <article class="runtime-card"><span>N</span><h3>Notes Drawer</h3><p>在观众视图临时查看当前页讲稿；speaker notes 不显示在幻灯片画面里。</p></article>
      </div>
    </section>
  </main>
  <script>
    function scalePreviews() {
      document.querySelectorAll(".deck-preview").forEach((preview) => {
        const frame = preview.querySelector("iframe");
        if (!frame) return;
        frame.style.transform = "scale(" + preview.clientWidth / 1280 + ")";
      });
    }

    window.addEventListener("resize", scalePreviews);
    scalePreviews();
  </script>
</body>
</html>`;
}

function renderDeckCard(deck: ShowcaseDeck): string {
  return `<article class="deck-card">
    <div class="deck-preview"><iframe title="${escapeHtml(deck.title)}" src="${escapeHtml(deck.previewHref)}"></iframe></div>
    <div class="deck-body">
      <div class="deck-meta">
        <span>${escapeHtml(deck.theme)}</span>
        <span>${escapeHtml(deck.aspectRatio)}</span>
        <span>${deck.slideCount} slides</span>
        ${deck.language ? `<span>${escapeHtml(deck.language)}</span>` : ""}
      </div>
      <h3>${escapeHtml(deck.title)}</h3>
      <p>${escapeHtml(deck.goal)}</p>
      <a class="deck-link" href="${escapeHtml(deck.href)}">Open deck</a>
    </div>
  </article>`;
}

function renderThemeCard(deck: ShowcaseDeck): string {
  return `<article class="theme-card">
    <div class="deck-preview"><iframe title="${escapeHtml(deck.theme)}" src="${escapeHtml(deck.previewHref)}"></iframe></div>
    <div class="deck-body">
      <h3>${escapeHtml(deck.theme)}</h3>
      <p>${escapeHtml(deck.title)}</p>
    </div>
  </article>`;
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function relativeHref(fromDir: string, toPath: string): string {
  return path.relative(fromDir, toPath).split(path.sep).join("/");
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

void main();
