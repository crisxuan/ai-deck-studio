# ppt-html-studio / AI Deck Studio

<p>
  <a href="#zh">中文</a> |
  <a href="#en">English</a>
</p>

<a id="zh"></a>

## 中文

<p><a href="#en">Switch to English</a></p>

AI Deck Studio 是一个面向 AI Agent 的演示文稿生成系统。它不是让模型直接手写 PPT 页面，而是让模型先设计故事，再生成结构化 `deck.json`，最后由稳定的渲染器输出经过视觉检查的 HTML / PDF / PNG 成品。

一句话定位：

> 先规划叙事，再生成结构化 deck spec，最后稳定出片。

## 当前状态

这是一个可运行的 MVP。当前已经支持：

- 从 `deck.json` 渲染静态 HTML 演示文稿
- 用 `deck.schema.json` 做结构校验
- 10 种核心 slide layout
- 3 套生产级主题
- 键盘翻页和页面导航
- speaker notes 字段支持
- Playwright 截图验证
- PDF 导出
- PNG 逐页导出
- 3 份完整示例 deck

## 为什么需要它

很多 AI 生成幻灯片的流程会遇到三个问题：

- 页面由模型自由写 HTML，视觉风格容易不一致。
- 按页生成内容，缺少清晰故事线。
- 最终产物没有自动视觉检查，交付前需要大量人工清理。

AI Deck Studio 的设计把职责拆开：

- LLM 负责意图理解、内容组织、故事规划和结构化 spec。
- 渲染系统负责布局、字体、主题和一致性。
- 验证系统负责截图、溢出、空白页、控制台错误等质量检查。
- 导出系统负责生成 HTML、PDF 和 PNG 等交付物。

## 适合谁

- 使用 Codex、Claude Code、Cursor 等工具生成演示文稿的 AI coding agent
- 想把 deck 生成能力集成进工作流的开发者
- 需要快速生成 pitch deck、技术分享、周报、课程材料或社媒轮播图的人

## 安装

```bash
npm install
```

如果你需要运行 `verify` 或 `export`，第一次使用 Playwright 时可能还需要安装 Chromium：

```bash
npx playwright install chromium
```

## 快速开始

渲染技术分享示例：

```bash
npm run render -- examples/tech-sharing/deck.json
```

打开生成的 HTML：

```txt
examples/tech-sharing/output/index.html
```

运行视觉验证：

```bash
npm run verify -- examples/tech-sharing/output/index.html
```

导出 PDF：

```bash
npm run export -- examples/tech-sharing/output/index.html --format pdf
```

导出 PNG：

```bash
npm run export -- examples/tech-sharing/output/index.html --format png
```

## CLI 命令

开发时推荐使用 npm scripts：

```bash
npm run validate -- examples/tech-sharing/deck.json
npm run render -- examples/tech-sharing/deck.json
npm run verify -- examples/tech-sharing/output/index.html
npm run export -- examples/tech-sharing/output/index.html --format pdf
npm run export -- examples/tech-sharing/output/index.html --format png
```

构建后或作为包安装后，可以使用 `ai-deck`：

```bash
ai-deck init my-deck
ai-deck validate examples/tech-sharing/deck.json
ai-deck render examples/tech-sharing/deck.json
ai-deck verify examples/tech-sharing/output/index.html
ai-deck export examples/tech-sharing/output/index.html --format pdf
ai-deck export examples/tech-sharing/output/index.html --format png
```

### 命令说明

| 命令 | 作用 |
| --- | --- |
| `init <directory>` | 创建一个 starter `deck.json` |
| `validate <deck.json>` | 校验 deck schema 和内容长度建议 |
| `render <deck.json>` | 输出静态 HTML 到 `output/index.html` |
| `verify <index.html\|url>` | 截图每一页并生成验证报告 |
| `export <index.html\|url> --format pdf` | 导出单个 PDF |
| `export <index.html\|url> --format png` | 导出逐页 PNG |

## 生成流程

推荐的 agent 工作流：

```txt
用户需求
  -> 明确或推断受众、目标、页数、风格
  -> 规划故事线
  -> 生成 deck.json
  -> 校验 schema 和内容限制
  -> 渲染静态 HTML
  -> 截图验证
  -> 根据验证报告修复 deck.json 或布局
  -> 导出 HTML / PDF / PNG
```

重要原则：

- 先写故事，再写 slide。
- 先写 `deck.json`，不要直接手写 HTML。
- 先验证，再导出。
- 修复问题时优先改内容长度，其次改 layout 或主题。

## Deck Schema

核心 schema 文件：

```txt
deck.schema.json
```

顶层必填字段：

- `version`
- `title`
- `audience`
- `goal`
- `theme`
- `aspectRatio`
- `slides`

推荐字段：

- `tone`
- `language`
- `story.thesis`
- `story.arc`

最小示例：

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

## 支持的布局

| Layout | 用途 |
| --- | --- |
| `cover` | 封面 |
| `agenda` | 议程 |
| `section` | 章节分隔页 |
| `key-insight` | 单个关键洞察 |
| `two-column` | 左右两栏说明 |
| `comparison` | 对比、前后变化、方案比较 |
| `timeline` | 时间线、路线图、阶段计划 |
| `metric-grid` | 指标概览 |
| `code` | 代码或结构化片段展示 |
| `closing` | 结尾、总结、下一步 |

## 支持的主题

| Theme | 适用场景 |
| --- | --- |
| `consulting-clean` | 商业汇报、战略报告、投资人材料 |
| `tech-dark` | 技术分享、架构评审、开发者演示 |
| `xiaohongshu-editorial` | 小红书风格、移动端轮播、轻量科普 |

主题只改变视觉语言，不改变 deck 内容结构。

## 示例 Deck

| 示例 | 主题 | 比例 | 路径 |
| --- | --- | --- | --- |
| Investor Pitch | `consulting-clean` | `16:9` | `examples/investor-pitch/deck.json` |
| Technical Sharing | `tech-dark` | `16:9` | `examples/tech-sharing/deck.json` |
| Weekly Report | `xiaohongshu-editorial` | `3:4` | `examples/weekly-report/deck.json` |

技术分享示例覆盖了全部 10 个 MVP layout，适合用来做回归验证。

## 输出产物

渲染后默认输出到 deck 同级目录下的 `output/`：

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

## 视觉验证

`verify` 会使用 Playwright 打开 HTML deck，逐页截图，并生成 JSON 和文本报告。

MVP 检查项：

- 页面能正常渲染
- 浏览器控制台没有 error
- 没有资源加载失败
- slide 数量和 deck spec 一致
- 当前 slide 不为空白
- presentation view 没有 body 级滚动条
- 没有明显文字溢出
- 字体大小不低于基础可读阈值
- 做基础文字对比度采样

报告路径：

```txt
examples/tech-sharing/output/verification/summary.txt
examples/tech-sharing/output/verification/verification-report.json
```

## 导出

PDF：

```bash
npm run export -- examples/tech-sharing/output/index.html --format pdf
```

PNG：

```bash
npm run export -- examples/tech-sharing/output/index.html --format png
```

也可以指定输出路径：

```bash
npm run export -- examples/tech-sharing/output/index.html --format pdf --out artifacts/deck.pdf
npm run export -- examples/tech-sharing/output/index.html --format png --out artifacts/png
```

## 目录结构

```txt
ppt-html-studio/
├── README.md
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

## 面向 Agent 的使用方式

本仓库包含 `SKILL.md`，用于指导 AI agent 按正确流程生成和修复 deck：

1. 明确受众、目标、页数和风格。
2. 选择主题。
3. 先写故事计划。
4. 写 `deck.json`。
5. 运行校验。
6. 渲染 HTML。
7. 运行视觉验证。
8. 根据报告修复。
9. 导出 PDF 或 PNG。

## 常见问题

### Playwright 提示找不到浏览器

运行：

```bash
npx playwright install chromium
```

### `validate` 通过但页面不好看

先运行：

```bash
npm run verify -- path/to/output/index.html
```

然后查看：

```txt
path/to/output/verification/summary.txt
path/to/output/verification/screenshots/
```

优先缩短可见文案，必要时再调整 layout 或主题 CSS。

### 应该修改 HTML 吗

通常不应该。HTML 是渲染产物。请优先修改 `deck.json`、layout renderer 或主题 CSS。

## 当前限制

- 暂不支持 PPTX 导出
- 暂不包含 WYSIWYG 编辑器
- 暂不支持云端托管、账号和多人协作
- 视觉验证仍是基础版，还没有智能截图 diff、复杂元素重叠检测或 LLM 视觉点评

## 路线图

- 更强的视觉 QA：重叠检测、密度评分、截图 diff
- 更好的 PDF 导出和讲者备注导出
- PPTX 导出
- 本地预览编辑器
- 更多 deck 类型模板
- 社媒轮播图 artifact 打包

## 质量标准

一个可交付 deck 至少应满足：

- `deck.json` schema 无 error
- 所有 slide 都有明确角色
- 故事线有 thesis 和 arc
- 验证报告无 failed check
- 关键页面截图可读、无明显溢出
- PDF / PNG 与浏览器渲染基本一致

<p><a href="#zh">Back to 中文</a> | <a href="#en">Switch to English</a></p>

---

<a id="en"></a>

## English

<p><a href="#zh">切换到中文</a></p>

AI Deck Studio is an agent-facing presentation generation system. Instead of asking a model to hand-write slide HTML, it asks the model to design the story, write a structured `deck.json`, and let a stable renderer produce visually verified HTML / PDF / PNG artifacts.

Positioning:

> Narrative-first, schema-driven, visually verified AI presentations.

## Current Status

This repository is a runnable MVP. It currently supports:

- Rendering static HTML decks from `deck.json`
- Validating deck specs with `deck.schema.json`
- 10 core slide layouts
- 3 production-ready themes
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

### Command Reference

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

<p><a href="#en">Back to English</a> | <a href="#zh">切换到中文</a></p>
