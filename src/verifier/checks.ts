import type { Page } from "playwright";

export type CheckStatus = "pass" | "warn" | "fail";

export type VerificationCheck = {
  name: string;
  status: CheckStatus;
  message: string;
  details?: unknown;
};

export async function runDomChecks(page: Page): Promise<VerificationCheck[]> {
  const result = await page.evaluate(() => {
    const slide = document.querySelector(".slide.is-active") as HTMLElement | null;
    const canvas = slide?.querySelector(".slide-canvas") as HTMLElement | null;
    const bodyScrollX = document.documentElement.scrollWidth > window.innerWidth + 2;
    const bodyScrollY = document.documentElement.scrollHeight > window.innerHeight + 2;

    if (!slide || !canvas) {
      return {
        hasSlide: false,
        hasCanvas: false,
        bodyScrollX,
        bodyScrollY,
        textLength: 0,
        overflow: [],
        tinyText: [],
        emptyPlaceholders: [],
        brokenImages: [],
        contrastSample: null
      };
    }

    const textElements = Array.from(slide.querySelectorAll("h1,h2,h3,p,li,span,strong,code"))
      .filter((element) => {
        const htmlElement = element as HTMLElement;
        const rect = htmlElement.getBoundingClientRect();
        const style = window.getComputedStyle(htmlElement);

        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.visibility !== "hidden" &&
          style.display !== "none" &&
          Boolean(htmlElement.innerText.trim())
        );
      }) as HTMLElement[];

    const overflow = textElements
      .filter((element) => {
        if (element.closest("pre") || element.closest(".code-window")) {
          return false;
        }

        return element.scrollWidth > element.clientWidth + 8 || element.scrollHeight > element.clientHeight + 8;
      })
      .slice(0, 8)
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        text: element.innerText.trim().slice(0, 100),
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
        scrollHeight: element.scrollHeight,
        clientHeight: element.clientHeight
      }));

    const tinyText = textElements
      .filter((element) => Number.parseFloat(window.getComputedStyle(element).fontSize) < 12)
      .slice(0, 8)
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        text: element.innerText.trim().slice(0, 100),
        fontSize: window.getComputedStyle(element).fontSize
      }));

    const bodyStyle = window.getComputedStyle(document.body);
    const canvasStyle = window.getComputedStyle(canvas);
    const emptyPlaceholders = Array.from(
      slide.querySelectorAll(
        ".device-grid span,.showcase-feature,.media-feature-metrics article,.product-media,.feature-media,.metric-tile,.data-metric,.market-segment,.architecture-layer,.content-panel,.comparison-side"
      )
    )
      .filter((element) => {
        const htmlElement = element as HTMLElement;
        const rect = htmlElement.getBoundingClientRect();
        const style = window.getComputedStyle(htmlElement);
        const hasMedia = Boolean(htmlElement.querySelector("img,svg,canvas,video"));

        return (
          rect.width > 0 &&
          rect.height > 0 &&
          style.visibility !== "hidden" &&
          style.display !== "none" &&
          !htmlElement.innerText.trim() &&
          !hasMedia
        );
      })
      .slice(0, 8)
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        className: (element as HTMLElement).className
      }));
    const brokenImages = Array.from(slide.querySelectorAll("img"))
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);

        return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
      })
      .filter((element) => element.naturalWidth === 0 || element.naturalHeight === 0)
      .slice(0, 8)
      .map((element) => ({
        src: element.getAttribute("src") ?? "",
        alt: element.getAttribute("alt") ?? ""
      }));

    return {
      hasSlide: true,
      hasCanvas: true,
      bodyScrollX,
      bodyScrollY,
      textLength: slide.innerText.trim().length,
      overflow,
      tinyText,
      emptyPlaceholders,
      brokenImages,
      contrastSample: {
        color: bodyStyle.color,
        backgroundColor: canvasStyle.backgroundColor
      }
    };
  });

  const checks: VerificationCheck[] = [];

  checks.push({
    name: "slide-present",
    status: result.hasSlide && result.hasCanvas ? "pass" : "fail",
    message: result.hasSlide && result.hasCanvas ? "Active slide and canvas are present." : "No active slide canvas found."
  });

  checks.push({
    name: "body-scrollbars",
    status: result.bodyScrollX || result.bodyScrollY ? "fail" : "pass",
    message:
      result.bodyScrollX || result.bodyScrollY
        ? "Presentation viewport has unintended body-level scrollbars."
        : "No body-level scrollbars detected."
  });

  checks.push({
    name: "non-blank-slide",
    status: result.textLength > 0 ? "pass" : "fail",
    message: result.textLength > 0 ? "Slide contains visible text content." : "Slide appears blank."
  });

  checks.push({
    name: "text-overflow",
    status: result.overflow.length ? "fail" : "pass",
    message: result.overflow.length ? `${result.overflow.length} visible text element(s) overflow.` : "No obvious text overflow detected.",
    details: result.overflow
  });

  checks.push({
    name: "minimum-font-size",
    status: result.tinyText.length ? "warn" : "pass",
    message: result.tinyText.length ? `${result.tinyText.length} text element(s) are below 12px.` : "Readable font size threshold is respected.",
    details: result.tinyText
  });

  checks.push({
    name: "empty-content-placeholders",
    status: result.emptyPlaceholders.length ? "fail" : "pass",
    message: result.emptyPlaceholders.length
      ? `${result.emptyPlaceholders.length} visible content placeholder(s) are empty.`
      : "No empty content placeholders detected.",
    details: result.emptyPlaceholders
  });

  checks.push({
    name: "image-natural-size",
    status: result.brokenImages.length ? "fail" : "pass",
    message: result.brokenImages.length ? `${result.brokenImages.length} visible image(s) failed to load.` : "Visible images report natural dimensions.",
    details: result.brokenImages
  });

  if (result.contrastSample) {
    const ratio = contrastRatio(result.contrastSample.color, result.contrastSample.backgroundColor);
    checks.push({
      name: "basic-contrast",
      status: ratio !== null && ratio < 3 ? "warn" : "pass",
      message: ratio === null ? "Contrast sample could not be calculated." : `Body text contrast sample is ${ratio.toFixed(2)}:1.`,
      details: result.contrastSample
    });
  }

  return checks;
}

function contrastRatio(foreground: string, background: string): number | null {
  const fg = parseRgb(foreground);
  const bg = parseRgb(background);

  if (!fg || !bg) {
    return null;
  }

  const fgLuminance = relativeLuminance(fg);
  const bgLuminance = relativeLuminance(bg);
  const lighter = Math.max(fgLuminance, bgLuminance);
  const darker = Math.min(fgLuminance, bgLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function parseRgb(value: string): [number, number, number] | null {
  const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);

  if (!match) {
    return null;
  }

  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function relativeLuminance([red, green, blue]: [number, number, number]): number {
  const [r, g, b] = [red, green, blue].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
