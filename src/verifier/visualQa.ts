import type { Page } from "playwright";
import type { VerificationCheck } from "./checks.js";

export type VisualQaFinding = {
  slide?: number;
  type:
    | "layout-similarity"
    | "image-footprint"
    | "text-density"
    | "weak-visual-anchor"
    | "empty-looking-cards"
    | "repeated-rhythm"
    | "bad-crop-risk";
  message: string;
  suggestion: string;
  details?: unknown;
};

export type VisualQaReport = {
  status: "pass" | "warn";
  summary: {
    slides: number;
    visualWarnings: number;
  };
  findings: VisualQaFinding[];
};

export type VisualSlideStats = {
  index: number;
  id: string;
  type: string;
  variant: string;
  layoutClass: string;
  signature: string;
  theme: string;
  visualMood: string;
  textLength: number;
  textElementCount: number;
  cardCount: number;
  emptyLargeCards: number;
  mediaCount: number;
  imageAreaRatio: number;
  largestImageAreaRatio: number;
  visualAnchorAreaRatio: number;
  bigNumberCount: number;
  bigHeadingCount: number;
  comparisonStructure: boolean;
  badCropRisk: number;
};

export async function collectVisualSlideStats(page: Page, index: number, id: string): Promise<VisualSlideStats> {
  return (await page.evaluate(`(() => {
    const slideIndex = ${JSON.stringify(index)};
    const slideId = ${JSON.stringify(id)};
    const slide = document.querySelector(".slide.is-active");
    const canvas = slide ? slide.querySelector(".slide-canvas") : null;
    const composition = slide ? slide.querySelector(".composition") : null;
    const canvasRect = canvas ? canvas.getBoundingClientRect() : null;
    const canvasArea = canvasRect && canvasRect.width > 0 && canvasRect.height > 0 ? canvasRect.width * canvasRect.height : 1;

    if (!slide || !canvas) {
      return {
        index: slideIndex,
        id: slideId,
        type: "",
        variant: "default",
        layoutClass: "",
        signature: "missing",
        theme: "",
        visualMood: "",
        textLength: 0,
        textElementCount: 0,
        cardCount: 0,
        emptyLargeCards: 0,
        mediaCount: 0,
        imageAreaRatio: 0,
        largestImageAreaRatio: 0,
        visualAnchorAreaRatio: 0,
        bigNumberCount: 0,
        bigHeadingCount: 0,
        comparisonStructure: false,
        badCropRisk: 0
      };
    }

    function visibleElements(selector) {
      return Array.from(slide.querySelectorAll(selector)).filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);

        return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
      });
    }

    const type = slide.getAttribute("data-slide-type") || "";
    const classSource = composition || canvas;
    const classes = Array.from(classSource.classList);
    const layoutClass = classes.find((className) => className.endsWith("-layout")) || "layout-" + type;
    const variantClass = classes.find((className) => className.startsWith("variant-"));
    const variant = variantClass ? variantClass.replace(/^variant-/, "") : "default";
    const textElements = visibleElements("h1,h2,h3,p,li,span,strong,code");
    const cardElements = visibleElements(
      ".showcase-feature,.media-feature-metrics article,.product-metrics article,.metric-tile,.data-metric,.market-segment,.architecture-layer,.content-panel,.comparison-side,.tension-card,.proof-strip article,.ask-panel"
    );
    const imageElements = visibleElements("img");
    const visualAnchorElements = visibleElements(".visual-fallback,.product-device");
    const imageAreas = imageElements.map((image) => {
      const rect = image.getBoundingClientRect();
      return (rect.width * rect.height) / canvasArea;
    });
    const visualAnchorAreas = visualAnchorElements.map((element) => {
      const rect = element.getBoundingClientRect();
      return (rect.width * rect.height) / canvasArea;
    });
    const imageAreaRatio = imageAreas.reduce((total, area) => total + area, 0);
    const largestImageAreaRatio = imageAreas.length ? Math.max(...imageAreas) : 0;
    const visualAnchorAreaRatio = visualAnchorAreas.length ? Math.max(...visualAnchorAreas) : 0;
    const emptyLargeCards = cardElements.filter((element) => {
      const rect = element.getBoundingClientRect();
      const areaRatio = (rect.width * rect.height) / canvasArea;
      const hasMedia = Boolean(element.querySelector("img,svg,canvas,video"));

      return areaRatio > 0.075 && element.innerText.trim().length < 18 && !hasMedia;
    }).length;
    const bigNumberCount = textElements.filter((element) => {
      const text = element.innerText.trim();
      const size = Number.parseFloat(window.getComputedStyle(element).fontSize);

      return size >= 34 && (/[\\d%]/.test(text) || text.length <= 8);
    }).length;
    const bigHeadingCount = visibleElements("h1,h2").filter(
      (element) => Number.parseFloat(window.getComputedStyle(element).fontSize) >= 46
    ).length;
    const comparisonStructure = Boolean(slide.querySelector(".comparison-grid,.tension-grid,.market-map,.architecture-stack,.timeline-track"));
    const badCropRisk = imageElements.filter((image) => {
      const rect = image.getBoundingClientRect();
      const style = window.getComputedStyle(image);

      if (style.objectFit !== "cover" || image.naturalWidth <= 0 || image.naturalHeight <= 0 || rect.width <= 0 || rect.height <= 0) {
        return false;
      }

      const naturalRatio = image.naturalWidth / image.naturalHeight;
      const boxRatio = rect.width / rect.height;
      const mismatch = Math.max(naturalRatio / boxRatio, boxRatio / naturalRatio);

      return mismatch > 2.15;
    }).length;
    const visualFootprint = Math.max(largestImageAreaRatio, visualAnchorAreaRatio);
    const imageBand = visualFootprint >= 0.28 ? "large-image" : visualFootprint >= 0.12 ? "image" : "low-image";
    const cardBand = cardElements.length >= 6 ? "many-cards" : cardElements.length >= 3 ? "cards" : "few-cards";
    const themeClass = Array.from(document.body.classList).find((className) => className.startsWith("theme-"));

    return {
      index: slideIndex,
      id: slideId,
      type,
      variant,
      layoutClass,
      signature: layoutClass + ":" + variant + ":" + cardBand + ":" + imageBand,
      theme: themeClass ? themeClass.replace(/^theme-/, "") : "",
      visualMood: document.body.dataset.visualMood || "",
      textLength: slide.innerText.trim().length,
      textElementCount: textElements.length,
      cardCount: cardElements.length,
      emptyLargeCards,
      mediaCount: imageElements.length,
      imageAreaRatio,
      largestImageAreaRatio,
      visualAnchorAreaRatio,
      bigNumberCount,
      bigHeadingCount,
      comparisonStructure,
      badCropRisk
    };
  })()`)) as VisualSlideStats;
}

export function runVisualQa(stats: VisualSlideStats[]): VisualQaReport {
  const findings: VisualQaFinding[] = [];
  const brandOrProductDeck = stats.some((slide) =>
    ["brand-showcase", "appliance-showroom", "luxury", "premium-keynote"].includes(slide.visualMood || slide.theme)
  );

  for (let index = 1; index < stats.length; index += 1) {
    const previous = stats[index - 1];
    const current = stats[index];

    if (previous.signature === current.signature && previous.type === current.type) {
      findings.push({
        slide: current.index + 1,
        type: "layout-similarity",
        message: `Slide ${previous.index + 1} and slide ${current.index + 1} use highly similar ${current.layoutClass} structures.`,
        suggestion: "Change one slide's layoutVariant, media placement, or slide type so adjacent pages have distinct visual roles.",
        details: { previous: previous.signature, current: current.signature }
      });
    }
  }

  for (let index = 2; index < stats.length; index += 1) {
    const trio = [stats[index - 2], stats[index - 1], stats[index]];
    const sameRhythm = trio.every((slide) => slide.signature === trio[0].signature);

    if (sameRhythm) {
      findings.push({
        slide: stats[index].index + 1,
        type: "repeated-rhythm",
        message: `Slides ${index - 1}-${index + 1} repeat the same grid/card rhythm.`,
        suggestion: "Break the run with a hero, quote, comparison, full-bleed media, or single-big-number variant.",
        details: { signature: stats[index].signature }
      });
    }
  }

  for (const slide of stats) {
    if (slide.textLength > 920 || (slide.cardCount >= 6 && slide.textLength > 700)) {
      findings.push({
        slide: slide.index + 1,
        type: "text-density",
        message: `Slide ${slide.index + 1} has dense visible text (${slide.textLength} characters across ${slide.textElementCount} text elements).`,
        suggestion: "Move supporting prose into presenterNotes, shorten card copy, or split the content into two slides.",
        details: { textLength: slide.textLength, textElementCount: slide.textElementCount, cardCount: slide.cardCount }
      });
    }

    if (
      brandOrProductDeck &&
      ["narrative-opener", "product-showcase", "media-feature"].includes(slide.type) &&
      slide.largestImageAreaRatio < 0.16 &&
      slide.visualAnchorAreaRatio < 0.18
    ) {
      findings.push({
        slide: slide.index + 1,
        type: "image-footprint",
        message: `Slide ${slide.index + 1} is image-led by role but its largest image or visual anchor occupies only ${(
          Math.max(slide.largestImageAreaRatio, slide.visualAnchorAreaRatio) * 100
        ).toFixed(0)}% of the canvas.`,
        suggestion: "Add a larger media asset, use a product-plinth/image-led variant, or make the visual fallback occupy at least a quarter of the slide.",
        details: {
          largestImageAreaRatio: slide.largestImageAreaRatio,
          visualAnchorAreaRatio: slide.visualAnchorAreaRatio,
          mediaCount: slide.mediaCount
        }
      });
    }

    if (!hasVisualAnchor(slide)) {
      findings.push({
        slide: slide.index + 1,
        type: "weak-visual-anchor",
        message: `Slide ${slide.index + 1} has no dominant image, big number, comparison structure, or strong headline anchor.`,
        suggestion: "Introduce one primary anchor: a large image, a single big metric, a comparison structure, or a stronger hero headline.",
        details: {
          largestImageAreaRatio: slide.largestImageAreaRatio,
          bigNumberCount: slide.bigNumberCount,
          bigHeadingCount: slide.bigHeadingCount,
          comparisonStructure: slide.comparisonStructure
        }
      });
    }

    if (slide.emptyLargeCards > 0) {
      findings.push({
        slide: slide.index + 1,
        type: "empty-looking-cards",
        message: `Slide ${slide.index + 1} has ${slide.emptyLargeCards} large card(s) that look under-filled.`,
        suggestion: "Merge sparse cards, reduce their footprint, or add concrete proof text so the cards look intentionally filled.",
        details: { emptyLargeCards: slide.emptyLargeCards }
      });
    }

    if (slide.badCropRisk > 0) {
      findings.push({
        slide: slide.index + 1,
        type: "bad-crop-risk",
        message: `Slide ${slide.index + 1} has ${slide.badCropRisk} cover-fit image(s) with a high crop-risk aspect mismatch.`,
        suggestion: "Switch the image fit to contain, adjust media.position, or use a crop that matches the rendered frame.",
        details: { badCropRisk: slide.badCropRisk }
      });
    }
  }

  return {
    status: findings.length ? "warn" : "pass",
    summary: {
      slides: stats.length,
      visualWarnings: findings.length
    },
    findings
  };
}

export function visualQaChecks(report: VisualQaReport): VerificationCheck[] {
  if (!report.findings.length) {
    return [
      {
        name: "visual-qa",
        status: "pass",
        message: "No visual QA warnings detected."
      }
    ];
  }

  return report.findings.map((finding): VerificationCheck => ({
    name: `visual-${finding.type}`,
    status: "warn",
    message: `${finding.slide ? `Slide ${finding.slide}: ` : ""}${finding.message} Suggestion: ${finding.suggestion}`,
    details: finding.details
  }));
}

function hasVisualAnchor(slide: VisualSlideStats): boolean {
  if (
    slide.largestImageAreaRatio >= 0.18 ||
    slide.visualAnchorAreaRatio >= 0.18 ||
    slide.bigNumberCount > 0 ||
    slide.bigHeadingCount > 0 ||
    slide.comparisonStructure
  ) {
    return true;
  }

  return ["quote-break", "final-ask", "closing", "cover", "section"].includes(slide.type);
}
