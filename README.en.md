# ppt-html-studio / AI Deck Studio

<p align="right">
  <a href="./README.md">中文</a> |
  <strong>English</strong>
</p>

AI Deck Studio is an agent-facing presentation generation system. Instead of asking a model to hand-write slide HTML, it asks the model to design the story, write a structured `deck.json`, and let a stable renderer produce visually verified HTML / PDF / PNG artifacts.

> Narrative-first, schema-driven, visually verified AI presentations.

## Current Status

This repository is a runnable MVP. It currently supports:

- Rendering static HTML decks from `deck.json`
- Validating deck specs with `deck.schema.json`
- 10 core slide layouts
- 3 themes
- Keyboard navigation and slide controls
- Speaker notes fields
- Playwright screenshot verification
- PDF export
- Per-slide PNG export
- 3 complete example decks

## Why This Exists

Many AI-generated slide workflows fail in three common ways:

- The model writes free-form HTML, so visual style drifts across slides.
- Slides are generated page by page, so the story is weak.
- The final artifact has no automated visual QA before delivery.

AI Deck Studio separates responsibilities:

- The LLM handles intent, content, narrative planning, and structured specs.
- The renderer handles layout, typography, themes, and consistency.
- The verifier handles screenshots, overflow, blank-slide checks, console errors, and other quality signals.
- The exporters produce practical HTML, PDF, and PNG deliverables.

## Who It Is For

- AI coding agents that generate presentation artifacts
- Developers integrating deck generation into local workflows
- People creating pitch decks, technical talks, weekly reports, course material, or social carousel posts

## Installation

```bash
npm install
```

If you need `verify` or `export`, install Chromium the first time Playwright asks for it:

```bash
npx playwright install chromium
```

## Quick Start

Render the technical sharing example:

```bash
npm run render -- examples/tech-sharing/deck.json
```

Open the generated HTML:

```txt
examples/tech-sharing/output/index.html
```

Run visual verification:

```bash
npm run verify -- examples/tech-sharing/output/index.html
```

Export PDF:

```bash
npm run export -- examples/tech-sharing/output/index.html --format pdf
```

Export PNG:

```bash
npm run export -- examples/tech-sharing/output/index.html --format png
```

## CLI

During development, use npm scripts:

```bash
npm run validate -- examples/tech-sharing/deck.json
npm run render -- examples/tech-sharing/deck.json
npm run verify -- examples/tech-sharing/output/index.html
npm run export -- examples/tech-sharing/output/index.html --format pdf
npm run export -- examples/tech-sharing/output/index.html --format png
```

After building or installing the package, use `ai-deck`:

```bash
ai-deck init my-deck
ai-deck validate examples/tech-sharing/deck.json
ai-deck render examples/tech-sharing/deck.json
ai-deck verify examples/tech-sharing/output/index.html
ai-deck export examples/tech-sharing/output/index.html --format pdf
ai-deck export examples/tech-sharing/output/index.html --format png
```

| Command | Purpose |
| --- | --- |
| `init <directory>` | Create a starter `deck.json` |
| `validate <deck.json>` | Validate schema and content-length recommendations |
| `render <deck.json>` | Render static HTML to `output/index.html` |
| `verify <index.html\|url>` | Screenshot every slide and create a verification report |
| `export <index.html\|url> --format pdf` | Export a single PDF |
| `export <index.html\|url> --format png` | Export per-slide PNG files |

## Generation Workflow

Recommended agent workflow:

```txt
User request
  -> Clarify or infer audience, goal, length, and style
  -> Plan the story
  -> Generate deck.json
  -> Validate schema and content limits
  -> Render static HTML
  -> Run screenshot verification
  -> Repair deck.json or layout from the report
  -> Export HTML / PDF / PNG
```

Core principles:

- Story before slides.
- `deck.json` before HTML.
- Verify before export.
- Repair content length first, layout or theme second.

## Deck Schema

Core schema file:

```txt
deck.schema.json
```

Required top-level fields:

- `version`
- `title`
- `audience`
- `goal`
- `theme`
- `aspectRatio`
- `slides`

Recommended fields:

- `tone`
- `language`
- `story.thesis`
- `story.arc`

Minimal example:

```json
{
  "version": "0.1.0",
  "title": "AI Agent Product Roadmap",
  "audience": "technical executives",
  "goal": "explain the roadmap and secure alignment",
  "theme": "consulting-clean",
  "aspectRatio": "16:9",
  "language": "en",
  "story": {
    "thesis": "The hard part is not model capability, but workflow closure.",
    "arc": [
      "AI demos are impressive but fragile.",
      "The missing layer is orchestration and verification.",
      "A staged roadmap can turn experiments into production workflows."
    ]
  },
  "slides": [
    {
      "id": "cover",
      "type": "cover",
      "title": "AI Agent Product Roadmap",
      "subtitle": "From capability demos to production workflows"
    },
    {
      "id": "core-insight",
      "type": "key-insight",
      "eyebrow": "Core insight",
      "headline": "The bottleneck is workflow closure, not raw model intelligence.",
      "points": [
        "Context must be collected safely.",
        "Tool calls must be permissioned.",
        "Outputs must be verified."
      ]
    }
  ]
}
```

## Supported Layouts

| Layout | Use |
| --- | --- |
| `cover` | Cover slide |
| `agenda` | Agenda |
| `section` | Section divider |
| `key-insight` | One dominant insight |
| `two-column` | Two-column explanation |
| `comparison` | Before/after, A/B, or option comparison |
| `timeline` | Roadmap, sequence, or staged plan |
| `metric-grid` | KPI overview |
| `code` | Code or structured snippet |
| `closing` | Summary, next steps, and contact |

## Supported Themes

| Theme | Best For |
| --- | --- |
| `consulting-clean` | Business briefings, strategy reports, investor material |
| `tech-dark` | Technical talks, architecture reviews, developer demos |
| `xiaohongshu-editorial` | Mobile-first explainers and social carousel posts |

Themes change the visual language without changing the deck content contract.

## Example Decks

| Example | Theme | Ratio | Path |
| --- | --- | --- | --- |
| Investor Pitch | `consulting-clean` | `16:9` | `examples/investor-pitch/deck.json` |
| Technical Sharing | `tech-dark` | `16:9` | `examples/tech-sharing/deck.json` |
| Weekly Report | `xiaohongshu-editorial` | `3:4` | `examples/weekly-report/deck.json` |

The technical sharing example covers all 10 MVP layouts and is useful for regression checks.

## Output Artifacts

Rendered output is written to the deck's sibling `output/` directory by default:

```txt
examples/tech-sharing/output/
├── index.html
├── deck.pdf
├── png/
│   ├── slide-01.png
│   └── ...
└── verification/
    ├── summary.txt
    ├── verification-report.json
    └── screenshots/
        ├── slide-01.png
        └── ...
```

## Visual Verification

`verify` opens the HTML deck with Playwright, screenshots each slide, and writes JSON plus text reports.

MVP checks:

- Page renders successfully
- No browser console errors
- No failed asset requests
- Slide count matches the deck spec
- Active slide is not blank
- No body-level scrollbars in presentation view
- No obvious text overflow
- Text stays above the basic readable-size threshold
- Basic text contrast is sampled

Report paths:

```txt
examples/tech-sharing/output/verification/summary.txt
examples/tech-sharing/output/verification/verification-report.json
```

## Export

PDF:

```bash
npm run export -- examples/tech-sharing/output/index.html --format pdf
```

PNG:

```bash
npm run export -- examples/tech-sharing/output/index.html --format png
```

You can also specify output paths:

```bash
npm run export -- examples/tech-sharing/output/index.html --format pdf --out artifacts/deck.pdf
npm run export -- examples/tech-sharing/output/index.html --format png --out artifacts/png
```

## Repository Structure

```txt
ppt-html-studio/
├── README.md
├── README.en.md
├── SKILL.md
├── package.json
├── deck.schema.json
├── examples/
│   ├── investor-pitch/
│   ├── tech-sharing/
│   └── weekly-report/
├── src/
│   ├── cli/
│   ├── core/
│   ├── planner/
│   ├── renderer/
│   ├── layouts/
│   ├── themes/
│   ├── runtime/
│   ├── verifier/
│   └── exporters/
├── scripts/
└── docs/
```

## Agent Usage

This repository includes `SKILL.md` to guide AI agents through the expected workflow:

1. Clarify audience, goal, length, and style.
2. Choose a theme.
3. Plan the story first.
4. Write `deck.json`.
5. Validate.
6. Render HTML.
7. Run visual verification.
8. Repair from the report.
9. Export PDF or PNG.

## Troubleshooting

### Playwright Cannot Find a Browser

Run:

```bash
npx playwright install chromium
```

### `validate` Passes but the Deck Looks Wrong

Run:

```bash
npm run verify -- path/to/output/index.html
```

Then inspect:

```txt
path/to/output/verification/summary.txt
path/to/output/verification/screenshots/
```

Prefer shortening visible text first. Only adjust layout or theme CSS when the content is already reasonable.

### Should I Edit Generated HTML?

Usually no. HTML is a generated artifact. Prefer editing `deck.json`, layout renderers, or theme CSS.

## Current Limitations

- No PPTX export yet
- No WYSIWYG editor yet
- No cloud hosting, accounts, or collaboration
- Visual verification is still basic: no smart screenshot diffing, complex overlap detection, or LLM visual critique yet

## Roadmap

- Stronger visual QA: overlap checks, density scores, screenshot diffs
- Better PDF export and speaker-notes export
- PPTX export
- Local preview editor
- More deck-type templates
- Social carousel artifact packaging

## Quality Bar

A deliverable deck should meet at least this bar:

- `deck.json` has no schema errors
- Every slide has a clear role
- The story has a thesis and arc
- Verification report has no failed checks
- Important screenshots are readable and free of obvious overflow
- PDF / PNG output closely matches browser rendering
