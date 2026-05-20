# AI Deck Studio

<p align="center">
  <img src="./assets/logo.svg" alt="AI Deck Studio" width="760">
</p>

<p align="center">
  <a href="./README.md">中文</a>
  ·
  <strong>English</strong>
</p>

<p align="center">
  <a href="https://htmlpreview.github.io/?https://github.com/crisxuan/ai-deck-studio/blob/main/docs/index.html">Live Preview</a>
  ·
  <a href="https://htmlpreview.github.io/?https://github.com/crisxuan/ai-deck-studio/blob/main/docs/cxuanai-wechat-promo-zh/index.html">cxuanAI Example</a>
  ·
  <a href="./LICENSE">MIT License</a>
  ·
  <a href="./docs/authoring-guide.md">Authoring Guide</a>
  ·
  <a href="./deck.schema.json">Deck Schema</a>
</p>

AI Deck Studio is an HTML presentation generation framework for AI agents. It asks the model to create a structured `deck.json`, then uses stable themes, layouts, verification, and exporters to produce shareable HTML / PNG / PDF / PPTX artifacts.

It is useful for brand strategy decks, product stories, technical talks, review decks, operating reports, and social media carousels. The project is not about letting AI randomly write pages; it turns story, layout, theme, and QA into a controllable pipeline.

## Preview

- Project showcase: https://htmlpreview.github.io/?https://github.com/crisxuan/ai-deck-studio/blob/main/docs/index.html
- cxuanAI social carousel: https://htmlpreview.github.io/?https://github.com/crisxuan/ai-deck-studio/blob/main/docs/cxuanai-wechat-promo-zh/index.html
- Reserved GitHub Pages URL: https://crisxuan.github.io/ai-deck-studio/

> GitHub Pages works after it is enabled in repository settings. Until then, the HTML Preview links above open directly.

## Features

- Structured `deck.json` authoring instead of hand-written final HTML.
- Multiple slide layouts and composition layouts.
- Theme system for launch decks, technical blueprints, dashboards, brand proposals, and social carousels.
- Chinese / English README switching and language-switchable examples.
- Playwright screenshot verification, visual QA, and contact-sheet previews.
- HTML, per-slide PNG, PDF, and image-based PPTX export.
- Shareable output for GitHub Pages or any static host.

## Quick Start

```bash
npm install
npm run render -- examples/cxuanai-wechat-promo-zh/deck.json
npm run verify -- examples/cxuanai-wechat-promo-zh/output/index.html --visual
npm run export -- examples/cxuanai-wechat-promo-zh/output/index.html --format png
```

Generate all examples and the local showcase:

```bash
npm run showcase
open showcase/index.html
```

## Workflow

```txt
Brief
  -> Plan audience, goal, and narrative
  -> Write deck.json
  -> Render HTML
  -> Run visual verification
  -> Repair content or layout
  -> Export / publish / share
```

## Examples

| Example | Type | Path |
| --- | --- | --- |
| cxuanAI WeChat promo | Social carousel | [`examples/cxuanai-wechat-promo-zh`](./examples/cxuanai-wechat-promo-zh/deck.json) |
| BenQ RD280U brand strategy | Brand proposal | [`examples/benq-rd280u-brand-strategy-zh`](./examples/benq-rd280u-brand-strategy-zh/deck.json) |
| Haier fridge brand story | Appliance brand | [`examples/haier-fridge-brand-zh`](./examples/haier-fridge-brand-zh/deck.json) |
| Developer year-end review | Engineering review | [`examples/developer-year-end-review-zh`](./examples/developer-year-end-review-zh/deck.json) |

## Docs

- Authoring guide: [`docs/authoring-guide.md`](./docs/authoring-guide.md)
- Layout guide: [`docs/layout-guide.md`](./docs/layout-guide.md)
- Theme guide: [`docs/theme-guide.md`](./docs/theme-guide.md)
- Visual quality bar: [`docs/visual-quality-bar.md`](./docs/visual-quality-bar.md)
- Architecture: [`docs/architecture.md`](./docs/architecture.md)
- Contributing: [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- Security: [`SECURITY.md`](./SECURITY.md)
- Notice: [`NOTICE.md`](./NOTICE.md)

## Positioning

AI Deck Studio is a local-first deck generation engine for AI agents. Its goal is to make generated presentations more stable, verifiable, and shareable. It is not a web editor or an all-purpose design tool; it is an engineering pipeline from structured content to polished HTML decks.

## Open Source

AI Deck Studio is released under the [`MIT License`](./LICENSE). Example decks may refer to real brands or products nominatively; trademarks belong to their respective owners. Bundled example images are original illustrative placeholders, and commercial work should replace sample assets and copy with material you have the right to use.
