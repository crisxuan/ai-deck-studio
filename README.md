# AI Deck Studio

<p align="center">
  <img src="./assets/logo.svg" alt="AI Deck Studio" width="760">
</p>

<p align="center">
  <strong>中文</strong>
  ·
  <a href="./README.en.md">English</a>
</p>

<p align="center">
  <a href="https://htmlpreview.github.io/?https://github.com/crisxuan/ai-deck-studio/blob/main/docs/index.html">在线预览</a>
  ·
  <a href="https://htmlpreview.github.io/?https://github.com/crisxuan/ai-deck-studio/blob/main/docs/cxuanai-wechat-promo-zh/index.html">cxuanAI 示例</a>
  ·
  <a href="./LICENSE">MIT License</a>
  ·
  <a href="./docs/authoring-guide.md">创作指南</a>
  ·
  <a href="./deck.schema.json">Deck Schema</a>
</p>

AI Deck Studio 是一个面向 AI Agent 的 HTML 演示文稿生成框架。它让模型先生成结构化 `deck.json`，再由稳定的主题、布局、验证和导出流程生成可分享的 HTML / PNG / PDF / PPTX。

它适合用来生成品牌策划、产品介绍、技术分享、述职报告、经营复盘和自媒体轮播等内容。项目的重点不是“让 AI 随机写页面”，而是把故事、布局、主题和质量检查拆成可控流程。

## 在线预览

- 项目展示页：https://htmlpreview.github.io/?https://github.com/crisxuan/ai-deck-studio/blob/main/docs/index.html
- cxuanAI 公众号推广轮播：https://htmlpreview.github.io/?https://github.com/crisxuan/ai-deck-studio/blob/main/docs/cxuanai-wechat-promo-zh/index.html
- GitHub Pages 预留地址：https://crisxuan.github.io/ai-deck-studio/

> GitHub Pages 需要在仓库设置中启用后才会生效；在此之前，上面的 HTML Preview 链接可直接打开。

## 能力概览

- 结构化 `deck.json` 创作，不直接手写最终 HTML。
- 多种 slide layout 和 composition layout。
- 多主题系统，覆盖发布会、技术蓝图、经营看板、品牌提案和社媒轮播。
- 支持中文 / 英文 README 与示例中的语言切换。
- Playwright 截图验证、visual QA 和 contact sheet 总览图。
- 支持 HTML、逐页 PNG、PDF 和图片型 PPTX 导出。
- 可生成适合 GitHub Pages 或静态托管的可分享页面。

## 快速开始

```bash
npm install
npm run render -- examples/cxuanai-wechat-promo-zh/deck.json
npm run verify -- examples/cxuanai-wechat-promo-zh/output/index.html --visual
npm run export -- examples/cxuanai-wechat-promo-zh/output/index.html --format png
```

生成全部示例和本地 showcase：

```bash
npm run showcase
open showcase/index.html
```

## 推荐工作流

```txt
需求 brief
  -> 规划受众、目标和故事线
  -> 编写 deck.json
  -> 渲染 HTML
  -> 运行视觉验证
  -> 修复内容或布局
  -> 导出 / 发布 / 分享
```

## 示例

| 示例 | 类型 | 路径 |
| --- | --- | --- |
| cxuanAI 公众号推广 | 自媒体轮播 | [`examples/cxuanai-wechat-promo-zh`](./examples/cxuanai-wechat-promo-zh/deck.json) |
| 明基 RD280U 品牌策划 | 品牌提案 | [`examples/benq-rd280u-brand-strategy-zh`](./examples/benq-rd280u-brand-strategy-zh/deck.json) |
| 海尔冰箱品牌介绍 | 家电品牌 | [`examples/haier-fridge-brand-zh`](./examples/haier-fridge-brand-zh/deck.json) |
| 程序员年终述职 | 技术述职 | [`examples/developer-year-end-review-zh`](./examples/developer-year-end-review-zh/deck.json) |

## 文档

- 创作指南：[`docs/authoring-guide.md`](./docs/authoring-guide.md)
- 布局指南：[`docs/layout-guide.md`](./docs/layout-guide.md)
- 主题指南：[`docs/theme-guide.md`](./docs/theme-guide.md)
- 视觉质量标准：[`docs/visual-quality-bar.md`](./docs/visual-quality-bar.md)
- 架构说明：[`docs/architecture.md`](./docs/architecture.md)
- 贡献指南：[`CONTRIBUTING.md`](./CONTRIBUTING.md)
- 安全策略：[`SECURITY.md`](./SECURITY.md)
- 开源声明：[`NOTICE.md`](./NOTICE.md)

## 项目定位

AI Deck Studio 是一个本地优先的 deck 生成引擎，目标是帮助 AI Agent 产出更稳定、更可验证、更容易分享的演示文稿。它不是在线编辑器，也不是万能设计工具；它更像一个“结构化内容 -> 高质量 HTML deck”的工程化流水线。

## 开源说明

本项目采用 [`MIT License`](./LICENSE)。示例 deck 可能以指称性方式提到真实品牌或产品，商标归各自权利方所有；仓库内示例图片使用原创示意素材，正式商业交付时请替换为你拥有使用权的素材和文案。
