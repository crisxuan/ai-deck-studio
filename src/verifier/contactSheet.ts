import fs from "node:fs/promises";
import path from "node:path";
import { chromium, type Page } from "playwright";
import { toBrowserUrl } from "./screenshot.js";

export type ContactSheetOptions = {
  outputPath?: string;
};

type CapturedSlide = {
  index: number;
  id: string;
  image: string;
};

export async function generateContactSheet(htmlPathOrUrl: string, options: ContactSheetOptions = {}): Promise<string> {
  const outputPath = options.outputPath ?? path.join(defaultArtifactParent(htmlPathOrUrl), "contact-sheet.png");
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });

  try {
    await page.goto(toBrowserUrl(htmlPathOrUrl), { waitUntil: "networkidle" });
    await adjustViewportForAspectRatio(page);

    const metadata = await page.evaluate(() => ({
      slideCount: document.querySelectorAll(".slide").length,
      aspectRatio: document.body.dataset.aspectRatio ?? "16:9",
      title: document.title || "Deck"
    }));
    const slides: CapturedSlide[] = [];

    for (let index = 0; index < metadata.slideCount; index += 1) {
      await page.evaluate((slideIndex) => {
        (window as unknown as { DeckRuntime?: { goTo: (index: number, options?: { silent?: boolean }) => void } }).DeckRuntime?.goTo(slideIndex, {
          silent: true
        });
      }, index);
      await page.waitForTimeout(180);

      const id = await page.evaluate(() => document.querySelector(".slide.is-active")?.getAttribute("data-slide-id") ?? "");
      const image = (await page.screenshot({ fullPage: false })).toString("base64");
      slides.push({ index, id, image });
    }

    const sheetPage = await browser.newPage({ viewport: viewportForSheet(slides.length), deviceScaleFactor: 1 });
    await sheetPage.setContent(renderContactSheet(metadata.title, metadata.aspectRatio, slides), { waitUntil: "load" });
    await sheetPage.screenshot({ path: outputPath, fullPage: true });
    await sheetPage.close();

    return outputPath;
  } finally {
    await browser.close();
  }
}

function renderContactSheet(title: string, aspectRatio: string, slides: CapturedSlide[]): string {
  const columns = sheetColumns(slides.length);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    :root {
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #111827;
      background: #e8edf3;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      padding: 28px;
      background: #e8edf3;
    }

    header {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 24px;
      margin-bottom: 18px;
      padding-bottom: 14px;
      border-bottom: 1px solid rgba(17, 24, 39, 0.14);
    }

    h1 {
      margin: 0;
      font-size: 26px;
      line-height: 1.1;
      letter-spacing: 0;
    }

    p {
      margin: 0;
      color: #5b6676;
      font-size: 13px;
      font-weight: 700;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(${columns}, 320px);
      gap: 18px;
      align-items: start;
    }

    figure {
      margin: 0;
      padding: 10px;
      border: 1px solid rgba(17, 24, 39, 0.14);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.86);
      box-shadow: 0 18px 44px rgba(17, 24, 39, 0.12);
    }

    img {
      display: block;
      width: 100%;
      aspect-ratio: ${aspectRatio.replace(":", " / ")};
      object-fit: cover;
      border-radius: 4px;
      background: #ffffff;
    }

    figcaption {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      padding-top: 8px;
      color: #4b5563;
      font-size: 11px;
      font-weight: 800;
      line-height: 1.25;
    }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(title)}</h1>
    <p>${slides.length} slides · contact sheet</p>
  </header>
  <main class="grid">
    ${slides
      .map(
        (slide) => `<figure>
      <img src="data:image/png;base64,${slide.image}" alt="Slide ${slide.index + 1}">
      <figcaption><span>${String(slide.index + 1).padStart(2, "0")}</span><span>${escapeHtml(slide.id)}</span></figcaption>
    </figure>`
      )
      .join("\n")}
  </main>
</body>
</html>`;
}

function viewportForSheet(slideCount: number): { width: number; height: number } {
  const columns = sheetColumns(slideCount);
  return {
    width: columns * 338 + 56,
    height: 900
  };
}

function sheetColumns(slideCount: number): number {
  return Math.min(4, Math.max(1, slideCount));
}

async function adjustViewportForAspectRatio(page: Page): Promise<void> {
  const aspectRatio = await page.evaluate(() => document.body.dataset.aspectRatio ?? "16:9");

  if (aspectRatio === "3:4") {
    await page.setViewportSize({ width: 1200, height: 1600 });
  } else if (aspectRatio === "4:3") {
    await page.setViewportSize({ width: 1400, height: 1050 });
  }
}

function defaultArtifactParent(input: string): string {
  if (/^https?:\/\//.test(input)) {
    return path.resolve("output");
  }

  const normalized = input.startsWith("file://") ? new URL(input).pathname : input;
  return path.dirname(path.resolve(normalized));
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
