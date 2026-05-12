# AI Deck Studio

<p align="center">
  <img src="./assets/logo.svg" alt="AI Deck Studio Logo" width="760">
</p>

<p align="right">
  <strong>中文</strong> |
  <a href="./README.en.md">English</a>
</p>

AI Deck Studio 是一个面向 AI Agent 的演示文稿生成系统。它不是让模型直接手写 PPT 页面，而是让模型先设计故事，再生成结构化 `deck.json`，最后由稳定的渲染器输出经过视觉检查的 HTML / PDF / PNG 成品。

> 先规划叙事，再生成结构化 deck spec，最后稳定出片。

## 当前状态

这是一个可运行的 MVP，已经支持：

- 从 `deck.json` 渲染静态 HTML 演示文稿
- 使用 `deck.schema.json` 做结构校验
- 10 种核心 slide layout
- 3 套主题
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

如果需要运行 `verify` 或 `export`，第一次使用 Playwright 时可能还需要安装 Chromium：

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

核心原则：

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
