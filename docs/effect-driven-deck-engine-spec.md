# Effect-Driven Deck Engine Spec

## 1. 背景

当前项目已经能把结构化 `deck.json` 稳定渲染成 HTML deck，并支持校验、截图、导出和 speaker notes。但现有生成路径仍然偏“模板引擎”：

```text
deck.json -> fixed layout -> theme CSS -> HTML
```

这导致产品介绍、品牌策划、公司汇报等示例在视觉上容易出现“同一套模板换内容”的问题。若只以最终效果衡量，项目必须从“模板数量”转向“效果质量”。

本规格的目标是把项目升级为：

```text
brief / reference
-> narrative plan
-> visual system plan
-> slide-level composition plan
-> HTML render
-> screenshot QA
-> automatic repair guidance
-> HTML / PNG / PDF / PPTX
```

一句话目标：

> 同一个题目生成出来，第一眼不像模板，第二眼像能拿去汇报。

## 2. 核心定位

项目不再追求成为通用 HTML 生成器，而要聚焦为：

> 面向 AI Agent 的专业商业/PPT deck 生成、评估和导出流水线。

优先服务以下场景：

- 品牌策划
- 产品介绍
- 公司汇报
- 经营复盘
- 述职报告
- 投资人路演
- 技术架构汇报

## 3. 非目标

以下事项不属于本轮优化目标：

- 不做通用 HTML artifact 平台。
- 不做文章、海报、小红书卡片、网页落地页的全能生成。
- 不靠继续堆大量相似主题解决问题。
- 不把每套 deck 都做成一个完全手写的 HTML 特例。
- 不牺牲现有 schema 校验、HTML 渲染、verify、export 的稳定性。

## 4. 成功标准

实现后，至少满足：

- 同一套 deck 内相邻页面不再明显同构。
- 产品/品牌类 deck 不再默认全部使用同一套 `premium-keynote` 表达。
- 每页都有清晰的视觉角色：hero、proof、system、comparison、campaign、closing 等。
- `npm test` 和 `npm run build` 通过。
- 示例 deck 可通过 `npm run verify`，无 overflow、无空卡片、无坏图。
- 能生成 contact sheet，让人一眼评估整套 deck 的节奏。
- 视觉 QA 能指出“太像模板”“页面太空”“图片占比不足”“文本过密”等问题。

## 5. P0：从模板路由改成视觉系统路由

### 5.1 Schema 增加 `visualSystem`

在 `deck.schema.json` 和 `src/core/schema.ts` 中增加可选字段：

```json
{
  "visualSystem": {
    "mood": "brand-showcase",
    "density": "editorial",
    "imageTreatment": "product-plinth",
    "compositionRhythm": "hero / proof / system / campaign",
    "colorIntent": "cool appliance showroom with blue and teal accents",
    "typographyIntent": "large keynote titles, restrained body copy",
    "qaPriorities": ["distinct page rhythm", "strong product imagery", "low template repetition"]
  }
}
```

建议字段：

| Field | Type | Required | 用途 |
| --- | --- | --- | --- |
| `mood` | string | no | 整体风格方向，例如 `brand-showcase`、`appliance-showroom`、`executive-review` |
| `density` | string | no | 信息密度，例如 `minimal`、`editorial`、`dense` |
| `imageTreatment` | string | no | 图片处理方式，例如 `full-bleed`、`product-plinth`、`cutout`、`annotated` |
| `compositionRhythm` | string | no | 整套 deck 的页面节奏 |
| `colorIntent` | string | no | 色彩策略 |
| `typographyIntent` | string | no | 字体层级策略 |
| `qaPriorities` | string[] | no | 视觉 QA 优先检查项 |

### 5.2 Slide 增加 `layoutVariant`

在 base slide 上增加可选字段：

```json
{
  "id": "product-language",
  "type": "product-showcase",
  "layoutVariant": "product-plinth",
  "visualIntent": "左侧用大产品图形成展台感，右侧用三条证据卡解释设计语言。"
}
```

建议：

- `layoutVariant` 放在 `baseSlide`，所有 slide type 都可使用。
- 先允许 string，避免 schema 过早锁死。
- renderer 根据 `layoutVariant` 输出额外 class，例如：

```html
<div class="composition product-showcase-layout variant-product-plinth">
```

### 5.3 Brief 默认主题路由

当前 `brief --profile brand-product` 不应永远落到 `premium-keynote`。应根据 brief 内容选择更合适的主题或 visual system。

建议路由：

| Brief 信号 | 推荐主题 |
| --- | --- |
| 冰箱、家电、厨房、厨居、保鲜 | `appliance-showroom` |
| 奢侈品、高定、珠宝、香水、美妆 | `luxury` |
| AI、智能体、开发者、代码、软件、平台 | `futuristic` 或 `technical-blueprint` |
| 小红书、种草、社媒、生活方式 | `xiaohongshu-editorial` |
| 经营复盘、公司汇报、指标 | `executive-dashboard` |
| 默认产品发布 | `premium-keynote` |

## 6. P1：为核心 slide type 增加构图变体

不要新增大量 slide type，优先给现有高级 composition 增加变体。

### 6.1 目标 slide type

至少覆盖：

- `narrative-opener`
- `hero-statement`
- `product-showcase`
- `media-feature`
- `data-story`
- `market-map`
- `system-architecture`
- `tension-resolution`
- `quote-break`
- `final-ask`

### 6.2 每类至少 3 个变体

建议变体：

| Slide Type | Variant | 用途 |
| --- | --- | --- |
| `narrative-opener` | `split-product` | 左标题，右产品展台 |
| `narrative-opener` | `full-bleed-image` | 大图压场开场 |
| `narrative-opener` | `editorial-cover` | 杂志封面式开场 |
| `product-showcase` | `product-plinth` | 产品图像主角，卖点辅助 |
| `product-showcase` | `annotated-product` | 产品图加标注 |
| `product-showcase` | `specimen-board` | 像设计板一样展示产品语言 |
| `media-feature` | `image-led` | 图片占主导 |
| `media-feature` | `feature-wall` | 特性墙 |
| `media-feature` | `captioned-proof` | 图片 + 证据说明 |
| `data-story` | `metric-wall` | 指标墙 |
| `data-story` | `single-big-number` | 单一大数字 |
| `data-story` | `left-claim-right-proof` | 左观点右证据 |
| `market-map` | `segment-cards` | 分群卡片 |
| `market-map` | `quadrant` | 四象限 |
| `market-map` | `journey-segments` | 场景旅程 |
| `final-ask` | `campaign-brief` | 传播建议 |
| `final-ask` | `decision-slide` | 决策请求 |
| `final-ask` | `next-actions` | 下一步行动 |

### 6.3 实现方式

推荐最小改动：

1. 在 renderer 中输出 variant class。
2. 在主题 CSS 中按 variant class 改 grid、图片占比、标题位置、卡片节奏。
3. 不要为每个 variant 新建完全独立 renderer，除非 DOM 结构明显不同。

涉及文件：

- `src/core/schema.ts`
- `deck.schema.json`
- `src/layouts/compositions.ts`
- `src/themes/*.css`
- `examples/*/deck.json`

## 7. P2：建立视觉 QA

现有 verifier 更像“坏没坏”检查，需要新增“好不好”的视觉检查。

### 7.1 Contact Sheet

新增命令或脚本：

```bash
npm run contact-sheet -- examples/haier-fridge-brand-zh/output/index.html
```

输出：

```text
examples/haier-fridge-brand-zh/output/contact-sheet.png
```

用途：

- 一眼看到整套 deck 是否有节奏。
- 检查是否连续多页同构。
- 检查是否存在弱视觉页。

### 7.2 Visual QA Report

新增命令或扩展现有 verify：

```bash
npm run verify -- examples/haier-fridge-brand-zh/output/index.html --visual
```

输出 JSON：

```json
{
  "status": "warn",
  "summary": {
    "slides": 11,
    "visualWarnings": 2
  },
  "findings": [
    {
      "slide": 3,
      "type": "layout-similarity",
      "message": "Slide 3 and slide 4 use highly similar two-column image/card structures."
    },
    {
      "slide": 6,
      "type": "low-visual-anchor",
      "message": "Slide has many cards but no dominant proof object or image."
    }
  ]
}
```

### 7.3 必须检查的视觉问题

优先实现简单、可解释的启发式规则：

- **layout similarity**：相邻页 DOM layout class、variant、截图结构过于相似。
- **image footprint**：品牌/产品 deck 中图片占比过低。
- **text density**：单页文字过多，尤其卡片内文本过密。
- **weak visual anchor**：没有大图、大数字、对比结构或强标题。
- **empty-looking cards**：卡片面积大但内容过少。
- **repeated rhythm**：连续 3 页都是同一 grid/card 模式。
- **bad crop risk**：图片主体被裁切严重。

### 7.4 可接受的技术路径

先不必上复杂 ML，可以用：

- Playwright 截图。
- DOM 结构统计。
- 文本长度统计。
- 图片 DOM 面积占比。
- 卡片数量统计。
- 简单像素/颜色直方图差异。

涉及文件：

- `src/verifier/checks.ts`
- `src/verifier/verifyDeck.ts`
- `src/cli/index.ts`
- `scripts/`

## 8. P3：Benchmark 驱动开发

新增 `benchmarks/` 目录，用固定题目测试效果。

建议结构：

```text
benchmarks/
  README.md
  briefs/
    haier-fridge-brand.md
    benq-rd280u-design.md
    quarterly-business-review.md
    developer-year-end-review.md
    ai-product-launch.md
  expected/
    rubric.md
```

### 8.1 固定题目

至少 5 个：

1. 海尔冰箱品牌策划
2. 明基 RD280U 产品设计介绍
3. 公司季度经营复盘
4. 程序员年终述职
5. AI 产品发布会

### 8.2 评分标准

每个题目按 5 项评分：

| 指标 | 说明 |
| --- | --- |
| 第一眼视觉冲击 | 是否有明显主视觉和高级感 |
| 每页构图差异 | 是否避免连续模板感 |
| PPT 专业度 | 是否像真实汇报 deck |
| 内容可汇报性 | 是否有清晰叙事和决策价值 |
| 导出稳定性 | HTML/PNG/PDF/PPTX 是否稳定 |

### 8.3 Benchmark 命令

建议新增：

```bash
npm run benchmark
```

最小实现：

- 读取 `benchmarks/briefs/*.md`
- 生成 deck spec
- render HTML
- verify
- export PNG
- 生成 contact sheet
- 输出 summary report

## 9. P4：参考驱动生成

支持输入参考页面、参考项目或参考截图，提取视觉节奏，而不是照抄内容。

目标输入：

```bash
ai-deck brief brief.md \
  --out examples/haier-fridge-brand-zh \
  --reference https://github.com/lewislulu/html-ppt-skill
```

参考分析应提取：

- 页面构图节奏
- 图片占比
- 字体层级
- 色彩倾向
- 卡片密度
- 每页角色
- 动效或交互方式

输出到 deck：

```json
{
  "visualSystem": {
    "reference": "https://github.com/lewislulu/html-ppt-skill",
    "compositionRhythm": "hero / proof / contrast / gallery / closing",
    "qaPriorities": ["beat reference on polish", "avoid direct cloning"]
  }
}
```

## 10. 推荐实施顺序

### Phase 1：Schema 和路由

- [ ] 增加 `visualSystem`
- [ ] 增加 `layoutVariant`
- [ ] renderer 输出 variant class
- [ ] brief 按内容选择主题/visualSystem
- [ ] 更新 README 和 authoring guide
- [ ] `npm run build`
- [ ] `npm test`

### Phase 2：强主题和构图变体

- [ ] 做一个强品牌/产品主题：`brand-showcase` 或完善 `appliance-showroom`
- [ ] 给 5 个核心 slide type 各做至少 3 个 variant
- [ ] 更新至少 3 个示例 deck，确保不再同构
- [ ] 导出 PNG 做 contact sheet 手工评估

### Phase 3：视觉 QA

- [ ] 新增 contact sheet 生成
- [ ] 新增 visual QA report
- [ ] 检查相邻页重复构图
- [ ] 检查图片占比
- [ ] 检查文本密度
- [ ] 检查弱视觉页

### Phase 4：Benchmark

- [ ] 新增 `benchmarks/` 目录
- [ ] 固定 5 个 brief
- [ ] 新增 `npm run benchmark`
- [ ] 输出 benchmark summary
- [ ] 每轮优化都用 benchmark 回归

### Phase 5：参考驱动

- [ ] 支持 `--reference`
- [ ] 支持参考截图/URL 的视觉摘要
- [ ] 将参考视觉节奏写入 `visualSystem`
- [ ] visual QA 检查“借鉴但不复制”

## 11. 验收命令

每轮改动至少运行：

```bash
npm run build
npm test
npm run render -- examples/haier-fridge-brand-zh/deck.json
npm run verify -- examples/haier-fridge-brand-zh/output/index.html
npm run export -- examples/haier-fridge-brand-zh/output/index.html --format png --out examples/haier-fridge-brand-zh/output/png
```

如果实现了新命令，还需要运行：

```bash
npm run contact-sheet -- examples/haier-fridge-brand-zh/output/index.html
npm run benchmark
```

## 12. Definition of Done

一个阶段只有在满足以下条件后才算完成：

- 代码通过 TypeScript build。
- 所有示例 deck 通过测试。
- 新增 schema 字段有文档。
- 至少一个真实示例使用了新能力。
- 输出 PNG 能证明视觉差异，而不是只在代码里宣称优化。
- verifier 或 visual QA 能捕捉至少一种以前无法发现的“模板感”问题。
- README 或 docs 中说明如何使用新能力。

## 13. 给执行 AI 的约束

执行本 spec 时请遵守：

- 不要重写整个项目。
- 不要删除现有示例。
- 不要破坏现有 `deck.json` 兼容性。
- 不要用新增大量相似主题代替构图变体。
- 不要让 HTML 变成不可维护的手写特例。
- 不要只改 CSS 不做验证。
- 每次交付必须附带：改动说明、运行命令、关键截图路径、剩余风险。

## 14. 最重要的判断标准

本项目继续存在的理由不是“也能生成 HTML”，而是：

> 能稳定生成真正像 PPT 汇报的高质量 deck，并且能自动发现和修复模板感。

如果实现后仍然只是“换主题、换文案、换图片”，则本轮优化失败。
