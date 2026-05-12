# AI Deck Studio PRD

## 1. Product Positioning

AI Deck Studio is an agent-facing presentation generation system.

It helps LLM agents turn raw material into polished, narrative-driven, visually verified presentation decks. The product is not just a theme/template library. It is a full generation workflow:

1. Understand user intent and audience.
2. Plan a story arc.
3. Generate a structured deck specification.
4. Render the deck into HTML.
5. Verify visual quality with screenshots.
6. Export to delivery formats such as PDF, PNG, and later PPTX.

Positioning statement:

> Narrative-first, schema-driven, visually verified AI presentations.

Chinese positioning:

> 不是让 AI 直接写 PPT 页面，而是让 AI 先设计故事，再由系统稳定出片。

## 2. Why This Should Exist

Current AI-generated slide workflows often fail in three ways:

- The deck looks inconsistent because the model writes free-form HTML or Markdown.
- The story is weak because slides are generated page by page instead of from a clear narrative plan.
- The final output is unreliable because there is no automated visual verification before delivery.

AI Deck Studio should solve these problems by separating responsibilities:

- LLM handles intent, content, story, and structured planning.
- The rendering system handles layout, typography, themes, and consistency.
- The verifier handles screenshot-based quality checks.
- Exporters handle real-world delivery.

## 3. Target Users

Primary users:

- AI coding agents that need to generate presentation artifacts.
- Builders using Codex, Claude Code, Cursor, or similar agent runtimes.
- Developers who want reusable deck generation in their workflows.

End users:

- Founders making pitch decks.
- Engineers preparing technical talks.
- Product teams making launch decks.
- Operators creating weekly or monthly reports.
- Creators making carousel-style social posts.
- Students or teachers making course slides.

## 4. Core Product Principles

1. Story before slides.
   Every deck must start with an audience, goal, thesis, and narrative arc.

2. Schema before HTML.
   The LLM should generate a structured deck spec first. HTML is rendered from the spec.

3. Fewer themes, higher quality.
   Prefer 6 excellent themes over 40 mediocre ones.

4. Every output should be inspectable.
   Decks should be static HTML files with readable structure and minimal magic.

5. Verification is part of generation.
   Screenshot checks are not optional polish; they are part of the core workflow.

6. Export must be practical.
   A user should be able to send, present, or archive the output without extra manual work.

## 5. MVP Scope

The first version should focus on quality and reliability, not breadth.

### 5.1 MVP Features

- Agent skill entry file: `SKILL.md`
- Structured deck spec: `deck.schema.json`
- Deck renderer: `deck.json -> static HTML`
- 3 production-quality themes:
  - `consulting-clean`
  - `tech-dark`
  - `xiaohongshu-editorial`
- 10 core layouts:
  - cover
  - agenda
  - section
  - key-insight
  - two-column
  - comparison
  - timeline
  - metric-grid
  - code
  - closing
- Speaker notes support.
- Keyboard navigation runtime.
- Playwright visual verification script.
- HTML to PNG export.
- HTML to PDF export.
- 3 complete example decks:
  - investor pitch
  - technical sharing
  - weekly report

### 5.2 Out of Scope for MVP

- Full WYSIWYG editor.
- Real-time collaborative editing.
- Cloud hosting.
- User accounts.
- PowerPoint `.pptx` export.
- Dozens of themes.
- Complex animation library.

These can be added after the core generation loop is strong.

## 6. Better-Than-Existing Differentiators

This project should compete on system quality, not asset count.

Key differentiators:

- Deck planning is explicit and structured.
- Generated output comes from a strict schema.
- Layouts are reusable rendering components, not copied HTML blobs.
- Visual QA is automated with screenshot analysis.
- The skill can iterate on failures: generate, verify, fix, verify again.
- Export is built into the workflow.
- The product optimizes for deliverable decks, not showcase demos.

## 7. Repository Structure

Recommended initial structure:

```txt
ai-deck-studio/
├── README.md
├── SKILL.md
├── package.json
├── deck.schema.json
├── examples/
│   ├── investor-pitch/
│   │   ├── deck.json
│   │   └── output/
│   ├── tech-sharing/
│   │   ├── deck.json
│   │   └── output/
│   └── weekly-report/
│       ├── deck.json
│       └── output/
├── src/
│   ├── cli/
│   │   └── index.ts
│   ├── core/
│   │   ├── schema.ts
│   │   ├── validate.ts
│   │   └── normalize.ts
│   ├── planner/
│   │   ├── prompts/
│   │   │   ├── story-planner.md
│   │   │   ├── deck-spec-writer.md
│   │   │   └── repair.md
│   │   └── README.md
│   ├── renderer/
│   │   ├── renderDeck.ts
│   │   ├── renderSlide.ts
│   │   └── htmlShell.ts
│   ├── layouts/
│   │   ├── cover.ts
│   │   ├── agenda.ts
│   │   ├── section.ts
│   │   ├── keyInsight.ts
│   │   ├── twoColumn.ts
│   │   ├── comparison.ts
│   │   ├── timeline.ts
│   │   ├── metricGrid.ts
│   │   ├── code.ts
│   │   └── closing.ts
│   ├── themes/
│   │   ├── base.css
│   │   ├── consulting-clean.css
│   │   ├── tech-dark.css
│   │   └── xiaohongshu-editorial.css
│   ├── runtime/
│   │   └── deck-runtime.js
│   ├── verifier/
│   │   ├── verifyDeck.ts
│   │   ├── checks.ts
│   │   └── screenshot.ts
│   └── exporters/
│       ├── exportPng.ts
│       └── exportPdf.ts
├── scripts/
│   ├── render-example.ts
│   ├── verify-example.ts
│   └── export-example.ts
└── docs/
    ├── architecture.md
    ├── authoring-guide.md
    ├── layout-guide.md
    ├── theme-guide.md
    └── visual-quality-bar.md
```

## 8. Deck Schema

The schema is the core product surface.

Example:

```json
{
  "version": "0.1.0",
  "title": "AI Agent Product Roadmap",
  "audience": "technical executives",
  "goal": "explain the roadmap and secure alignment",
  "tone": "clear, credible, pragmatic",
  "theme": "consulting-clean",
  "aspectRatio": "16:9",
  "language": "en",
  "story": {
    "thesis": "The hard part is not model capability, but workflow closure.",
    "arc": [
      "Current AI agent demos look powerful but break in real workflows.",
      "The missing layer is orchestration, verification, and permissioning.",
      "A staged roadmap can turn experiments into production systems."
    ]
  },
  "slides": [
    {
      "id": "cover",
      "type": "cover",
      "title": "AI Agent Product Roadmap",
      "subtitle": "From capability demos to production workflows",
      "presenterNotes": "Open by framing the gap between impressive demos and reliable operations."
    },
    {
      "id": "core-insight",
      "type": "key-insight",
      "eyebrow": "Core insight",
      "headline": "The bottleneck is workflow closure, not raw model intelligence.",
      "points": [
        "Context must be collected safely.",
        "Tool calls must be permissioned.",
        "Outputs must be verified.",
        "Failures need recovery paths."
      ],
      "presenterNotes": "Emphasize that this is an operating system problem, not only a model problem."
    }
  ]
}
```

Required top-level fields:

- `version`
- `title`
- `audience`
- `goal`
- `theme`
- `aspectRatio`
- `slides`

Each slide should include:

- `id`
- `type`
- content fields required by that layout
- optional `presenterNotes`
- optional `visualIntent`

## 9. Layout Contract

Every layout should define:

- Required fields.
- Optional fields.
- Rendering behavior.
- Content limits.
- Fallback behavior.

Example layout contract:

```ts
type KeyInsightSlide = {
  id: string;
  type: "key-insight";
  eyebrow?: string;
  headline: string;
  points?: string[];
  evidence?: string;
  presenterNotes?: string;
};
```

Content limits:

- `headline`: max 110 characters.
- `points`: 3 to 5 items.
- each point: max 90 characters.
- `evidence`: max 160 characters.

If content exceeds limits, the validator should warn before rendering.

## 10. Generation Workflow

The intended agent workflow:

```txt
User request
  ↓
Clarify or infer audience, goal, length, style
  ↓
Generate story plan
  ↓
Generate deck.json
  ↓
Validate schema and content limits
  ↓
Render static HTML
  ↓
Run visual verification
  ↓
Repair deck.json or layout if needed
  ↓
Export HTML / PNG / PDF
```

The LLM should not directly edit generated HTML unless repairing the renderer or layout implementation.

## 11. Visual Verification

The verifier should render each slide in Playwright and produce:

- screenshots
- JSON report
- human-readable summary

MVP checks:

- Page renders without browser console errors.
- No missing local assets.
- No obvious text overflow.
- No body-level scrollbars in slide view.
- Main slide area is not blank.
- Minimum readable font size is respected.
- Slides have enough contrast for common text surfaces.
- Expected slide count matches deck spec.

Future checks:

- Element overlap detection.
- Smart screenshot diffing.
- Contrast calculation from rendered pixels.
- Layout density score.
- LLM-based screenshot critique.

## 12. Export Requirements

MVP export formats:

- Static HTML deck.
- PNG per slide.
- Single PDF file.

Future export formats:

- PPTX.
- Speaker notes PDF.
- Social carousel image pack.
- Zip artifact containing HTML, assets, screenshots, and PDF.

## 13. Themes

MVP themes:

### consulting-clean

Use for executive briefings, consulting reports, strategy decks, business plans.

Visual qualities:

- white or near-white canvas
- strong grid
- restrained accent color
- clear hierarchy
- data-friendly

### tech-dark

Use for engineering talks, architecture reviews, developer demos, AI systems.

Visual qualities:

- dark background
- code-friendly typography
- calm accent colors
- strong contrast
- diagram-friendly surfaces

### xiaohongshu-editorial

Use for social carousel posts, consumer explainers, lightweight educational decks.

Visual qualities:

- 3:4 friendly
- editorial blocks
- warm but not childish
- image and quote friendly
- dense enough for mobile reading

## 14. Skill Behavior

`SKILL.md` should teach agents to:

- Ask for audience, deck goal, page count, and style when missing.
- Recommend defaults when the user is vague.
- Generate a story plan before deck spec.
- Write `deck.json`, not raw HTML.
- Run validation.
- Render and verify.
- Fix failures before returning final output.
- Export when requested.

Default recommendations:

- Business deck: `consulting-clean`
- Technical talk: `tech-dark`
- Social carousel: `xiaohongshu-editorial`

## 15. CLI Requirements

Recommended commands:

```bash
ai-deck init my-deck
ai-deck validate examples/tech-sharing/deck.json
ai-deck render examples/tech-sharing/deck.json
ai-deck verify examples/tech-sharing/output/index.html
ai-deck export examples/tech-sharing/output/index.html --format pdf
ai-deck export examples/tech-sharing/output/index.html --format png
```

MVP package scripts:

```json
{
  "scripts": {
    "build": "tsc",
    "validate": "tsx src/cli/index.ts validate",
    "render": "tsx src/cli/index.ts render",
    "verify": "tsx src/cli/index.ts verify",
    "export": "tsx src/cli/index.ts export"
  }
}
```

## 16. Success Metrics

MVP success:

- A user can generate a 10-slide deck from `deck.json` with one command.
- The rendered deck looks consistent across all slides.
- Verification catches at least the most common layout failures.
- Exported PDF is usable without manual cleanup.
- Example decks are good enough to show in the README.

Quality metrics:

- 0 schema validation errors.
- 0 missing asset errors.
- 0 slide-level browser console errors.
- 0 unintended scrollbars.
- 95% of text blocks fit within their containers.
- PDF export matches browser rendering closely.

## 17. Roadmap

### Phase 0: Foundation

- Set up repo, TypeScript, CLI, schema validation.
- Implement base renderer and static HTML shell.
- Implement 3 themes and 10 layouts.
- Add example decks.

### Phase 1: Verification Loop

- Add Playwright screenshot renderer.
- Add basic checks and JSON report.
- Add repair prompt docs for agents.
- Add screenshot output to examples.

### Phase 2: Export Quality

- Improve PDF export.
- Add PNG export per slide.
- Add export manifest.
- Add social carousel output mode.

### Phase 3: More Deck Types

- Add product launch template.
- Add course module template.
- Add data report template.
- Add founder pitch template.

### Phase 4: PPTX Export

- Map deck schema to PPTX primitives.
- Support speaker notes where possible.
- Add theme mapping.
- Add export regression examples.

### Phase 5: Local Preview App

- Add a small local web preview.
- Left panel for deck structure.
- Main area for slide preview.
- Theme switcher.
- Export buttons.

## 18. Non-Goals

The project should not become:

- A generic website builder.
- A huge CSS animation dump.
- A raw prompt collection with no renderer.
- A clone of PowerPoint.
- A template marketplace before the core quality loop is proven.

## 19. README Pitch

Suggested README opening:

> AI Deck Studio helps agents create professional presentation decks from structured specs. It plans the narrative, renders consistent HTML slides, verifies screenshots with Playwright, and exports production-ready PDF/PNG artifacts.

Suggested Chinese opening:

> AI Deck Studio 是一个面向 AI Agent 的演示文稿生成系统。它先规划叙事，再生成结构化 deck spec，最后渲染为经过视觉质检的 HTML / PDF / PNG 成品。

## 20. MVP Definition of Done

MVP is done when:

- `deck.schema.json` exists and validates example decks.
- `ai-deck render examples/tech-sharing/deck.json` generates a working HTML deck.
- The deck supports keyboard navigation.
- The 3 MVP themes can be applied without layout breakage.
- All 10 MVP layouts render with realistic content.
- `ai-deck verify` creates screenshots and a verification report.
- `ai-deck export --format pdf` creates a usable PDF.
- README includes screenshots from real rendered examples.
- `SKILL.md` explains the full agent workflow clearly enough for an LLM agent to use the repo.

