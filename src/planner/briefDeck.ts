import type { DeckSpec } from "../core/schema.js";

export type BriefDeckFlags = Record<string, string | boolean>;

export function deckFromBrief(brief: string, flags: BriefDeckFlags): DeckSpec {
  const profile = String(flags.profile ?? "brand-product");
  const title = String(flags.title ?? firstMeaningfulLine(brief) ?? "Untitled Brief Deck");
  const audience = String(flags.audience ?? "stakeholders");
  const goal = String(flags.goal ?? "turn the brief into a structured, visually verified deck");
  const language = String(flags.language ?? (/[\u4e00-\u9fff]/.test(brief) ? "zh-CN" : "en"));
  const theme = String(flags.theme ?? defaultThemeForProfile(profile, brief)) as DeckSpec["theme"];
  const excerpt = summarizeBrief(brief);
  const zh = language.toLowerCase().startsWith("zh");

  return {
    version: "0.3.0",
    title,
    audience,
    goal,
    tone: toneForProfile(profile),
    theme,
    aspectRatio: "16:9",
    language,
    visualSystem: visualSystemForBrief(profile, brief, theme, typeof flags.reference === "string" ? flags.reference : undefined),
    story: {
      thesis: zh ? `这套 deck 会把 brief 转化为面向 ${audience} 的清晰叙事。` : `This deck turns the brief into a focused narrative for ${audience}.`,
      arc: zh
        ? ["先明确受众和决策。", "再说明最有力的证据。", "最后收束到具体下一步。"]
        : ["Frame the audience and decision.", "Explain the strongest proof points.", "Close with a concrete next step."]
    },
    slides: [
      {
        id: "opener",
        type: "narrative-opener",
        layoutVariant: openerVariantForTheme(theme),
        visualIntent: zh ? "开场页要先建立主视觉角色和汇报气质，避免像普通模板封面。" : "Open with a strong visual role and presentation tone.",
        eyebrow: zh ? "Brief 转 Deck" : "Brief to Deck",
        title,
        subtitle: excerpt,
        chips: zh ? ["受众", "叙事", "证据", "下一步"] : ["Audience", "Narrative", "Proof", "Next step"],
        stat: { label: zh ? "Brief 长度" : "Brief length", value: `${brief.trim().length}`, detail: zh ? "字符" : "characters" }
      },
      {
        id: "core-claim",
        type: "hero-statement",
        layoutVariant: "split-proof",
        visualIntent: zh ? "用一个强观点和少量证据形成决策方向，而不是堆叠说明文字。" : "Use one strong claim with a small proof set.",
        eyebrow: zh ? "核心判断" : "Core claim",
        headline: zh ? "一套有效的 deck，会在最后一页之前就让决策变得清楚。" : "A useful deck makes the decision obvious before the final slide.",
        subheadline: zh ? "请把这句话替换为 brief 中最锋利的核心观点。" : "Replace this claim with the sharpest point from the source brief.",
        proofs: [
          { label: zh ? "受众" : "Audience", value: "1", detail: audience },
          { label: zh ? "目标" : "Goal", value: "1", detail: goal.slice(0, 120) },
          { label: zh ? "类型" : "Profile", value: profile, detail: zh ? "生成路径" : "generation route" }
        ]
      },
      {
        id: "brief-context",
        type: "comparison",
        layoutVariant: "decision-brief",
        title: zh ? "Brief 结构拆解" : "Brief structure",
        subtitle: zh ? "用这一页区分来源信息和真正需要推动的决策。" : "Use this page to separate source context from the decision you need.",
        left: {
          label: zh ? "已经知道什么" : "What we know",
          headline: compactHeadline(excerpt),
          points: zh ? ["保留准确的来源口径。", "把输入拆成可汇报证据。", "不要使用无来源指标。"] : ["Keep source language precise.", "Turn inputs into presentable proof.", "Avoid unsupported metrics."]
        },
        right: {
          label: zh ? "需要决定什么" : "What we need to decide",
          headline: compactHeadline(goal),
          points: zh ? ["说清楚决策。", "展示证据。", "把下一步具体化。"] : ["Name the decision.", "Show evidence.", "Make the next step concrete."]
        }
      },
      {
        id: "evidence",
        type: "data-story",
        layoutVariant: profile === "business" ? "metric-wall" : "left-claim-right-proof",
        visualIntent: zh ? "把证据做成视觉锚点，避免成为普通三卡片列表。" : "Make proof a visible anchor instead of a generic card list.",
        title: zh ? "需要补齐的证据" : "Evidence to collect",
        subtitle: zh ? "正式汇报前，把占位值替换为有来源的事实。" : "Replace placeholder values with sourced facts before presenting.",
        headline: zh ? "每一个判断都配上证据对象，deck 才真正可信。" : "The deck becomes credible when each claim has a proof object.",
        metrics: [
          { label: zh ? "市场信号" : "Market signal", value: "TBD", detail: zh ? "需要来源" : "source required" },
          { label: zh ? "用户证据" : "User proof", value: "TBD", detail: zh ? "需要来源" : "source required" },
          { label: zh ? "产品证据" : "Product proof", value: "TBD", detail: zh ? "需要来源" : "source required" }
        ],
        takeaway: zh ? "不要让漂亮的视觉系统包装没有证据的判断。" : "Do not let the visual system make unsupported claims look finished."
      },
      {
        id: "ask",
        type: "final-ask",
        layoutVariant: profile === "brand-product" ? "campaign-brief" : "next-actions",
        visualIntent: zh ? "收束到明确请求和下一步，让 deck 像汇报材料而不是内容草稿。" : "Close with a concrete ask and next actions.",
        title: zh ? "下一步" : "Next step",
        subtitle: zh ? "把 brief 推进成可以决策的 deck。" : "Turn the brief into a decision-ready deck.",
        ask: goal,
        actions: zh ? ["替换占位内容", "渲染并验证", "导出 HTML / PDF / PPTX"] : ["Replace placeholders", "Render and verify", "Export HTML / PDF / PPTX"],
        contact: "AI Deck Studio"
      }
    ]
  };
}

function defaultThemeForProfile(profile: string, brief = ""): DeckSpec["theme"] {
  if (profile === "engineering") {
    return "technical-blueprint";
  }

  if (profile === "business") {
    return "executive-dashboard";
  }

  if (profile === "brand-product") {
    return themeForBrandProductBrief(brief);
  }

  return "premium-keynote";
}

function themeForBrandProductBrief(brief: string): DeckSpec["theme"] {
  const text = brief.toLowerCase();

  if (/经营复盘|公司汇报|指标|财报|季度|okr|kpi|business review|quarterly|revenue|forecast/.test(text)) {
    return "executive-dashboard";
  }

  if (/冰箱|家电|厨房|厨居|洗衣机|空调|电视|母婴|食材|保鲜|appliance|kitchen|fridge|refrigerator/.test(text)) {
    return "appliance-showroom";
  }

  if (/奢侈|高定|珠宝|香水|美妆|酒店|艺术|luxury|fashion|beauty|jewelry/.test(text)) {
    return "luxury";
  }

  if (/小红书|种草|社媒|生活方式|内容营销|kol|social|campaign/.test(text)) {
    return "xiaohongshu-editorial";
  }

  if (/ai|智能体|开发者|代码|芯片|算力|api|developer|agent|software|platform/.test(text)) {
    return /架构|architecture|infra|infrastructure|系统/.test(text) ? "technical-blueprint" : "futuristic";
  }

  return "premium-keynote";
}

function visualSystemForBrief(
  profile: string,
  brief: string,
  theme: DeckSpec["theme"],
  reference?: string
): DeckSpec["visualSystem"] {
  const zh = /[\u4e00-\u9fff]/.test(brief);
  const basePriorities = zh
    ? ["相邻页面节奏不同", "每页有明确视觉角色", "避免模板感重复"]
    : ["distinct page rhythm", "clear visual role per slide", "low template repetition"];

  if (theme === "appliance-showroom") {
    return {
      mood: "brand-showcase",
      density: "editorial",
      imageTreatment: "product-plinth",
      compositionRhythm: "hero / proof / system / campaign",
      colorIntent: "cool appliance showroom with blue and teal accents",
      typographyIntent: "large keynote titles, restrained body copy",
      qaPriorities: [...basePriorities, zh ? "强产品图像" : "strong product imagery"],
      reference
    };
  }

  if (profile === "business" || theme === "executive-dashboard") {
    return {
      mood: "executive-review",
      density: "dense",
      imageTreatment: "metric-led",
      compositionRhythm: "claim / metric wall / diagnosis / decision",
      colorIntent: "neutral operating review with crisp contrast",
      typographyIntent: "compact executive headings and numeric hierarchy",
      qaPriorities: [...basePriorities, zh ? "指标必须形成视觉锚点" : "metrics must create visual anchors"],
      reference
    };
  }

  if (theme === "futuristic" || theme === "technical-blueprint") {
    return {
      mood: "technical-showcase",
      density: "editorial",
      imageTreatment: "annotated",
      compositionRhythm: "hero / system / proof / decision",
      colorIntent: "high-contrast technical palette with controlled accents",
      typographyIntent: "sharp large claims plus compact proof labels",
      qaPriorities: [...basePriorities, zh ? "系统页要可读" : "system slides must remain readable"],
      reference
    };
  }

  return {
    mood: profile === "brand-product" ? "brand-showcase" : "professional-deck",
    density: "editorial",
    imageTreatment: profile === "brand-product" ? "image-led" : "proof-led",
    compositionRhythm: "hero / proof / contrast / closing",
    colorIntent: "theme-led, differentiated by deck subject",
    typographyIntent: "presentation-scale titles with restrained supporting copy",
    qaPriorities: basePriorities,
    reference
  };
}

function openerVariantForTheme(theme: DeckSpec["theme"]): string {
  if (theme === "appliance-showroom" || theme === "luxury" || theme === "premium-keynote") {
    return "split-product";
  }

  if (theme === "editorial" || theme === "founder-editorial" || theme === "paper") {
    return "editorial-cover";
  }

  return "full-bleed-image";
}

function toneForProfile(profile: string): string {
  if (profile === "engineering") {
    return "technical, concrete, architecture-aware";
  }

  if (profile === "business") {
    return "executive, concise, metrics-led";
  }

  return "brand-led, visual, product-aware";
}

function firstMeaningfulLine(value: string): string | undefined {
  return value
    .split(/\r?\n/)
    .map((line) => line.replace(/^#+\s*/, "").trim())
    .find(Boolean)
    ?.slice(0, 100);
}

function summarizeBrief(value: string): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.slice(0, 220) || "Replace this subtitle with a concise summary of the source brief.";
}

function compactHeadline(value: string): string {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= 110) {
    return normalized;
  }

  return `${normalized.slice(0, 107).replace(/[,.，。;；:：\s]+$/g, "")}...`;
}
