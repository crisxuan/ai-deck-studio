import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { runDomChecks, type VerificationCheck } from "./checks.js";
import { captureActiveSlide, slideScreenshotPath, toBrowserUrl } from "./screenshot.js";
import { collectVisualSlideStats, runVisualQa, visualQaChecks, type VisualQaReport, type VisualSlideStats } from "./visualQa.js";

export type SlideVerification = {
  index: number;
  id: string;
  screenshot: string;
  checks: VerificationCheck[];
};

export type VerificationReport = {
  source: string;
  generatedAt: string;
  expectedSlideCount: number;
  actualSlideCount: number;
  status: "pass" | "warn" | "fail";
  summary: {
    passed: number;
    warnings: number;
    failed: number;
  };
  consoleErrors: string[];
  requestFailures: string[];
  slides: SlideVerification[];
  visualQa?: VisualQaReport;
};

export type VerifyOptions = {
  outputDir?: string;
  visual?: boolean;
};

export async function verifyDeck(htmlPathOrUrl: string, options: VerifyOptions = {}): Promise<VerificationReport> {
  const outputDir = options.outputDir ?? path.join(defaultArtifactParent(htmlPathOrUrl), "verification");
  await fs.mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
  const consoleErrors: string[] = [];
  const requestFailures: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  page.on("pageerror", (error) => {
    consoleErrors.push(error.message);
  });

  page.on("requestfailed", (request) => {
    requestFailures.push(`${request.url()} ${request.failure()?.errorText ?? "failed"}`);
  });

  try {
    await page.goto(toBrowserUrl(htmlPathOrUrl), { waitUntil: "networkidle" });
    await adjustViewportForAspectRatio(page);

    const metadata = await page.evaluate(() => ({
      expected: Number(document.body.dataset.slideCount ?? 0),
      actual: document.querySelectorAll(".slide").length
    }));

    const slides: SlideVerification[] = [];
    const visualStats: VisualSlideStats[] = [];

    for (let index = 0; index < metadata.actual; index += 1) {
      await page.evaluate((slideIndex) => {
        (window as unknown as { DeckRuntime?: { goTo: (index: number, options?: { silent?: boolean }) => void } }).DeckRuntime?.goTo(slideIndex, {
          silent: true
        });
      }, index);
      await page.waitForTimeout(240);

      const slideId = await page.evaluate(() => document.querySelector(".slide.is-active")?.getAttribute("data-slide-id") ?? "");
      const screenshot = slideScreenshotPath(outputDir, index);
      await captureActiveSlide(page, screenshot);
      const checks = await runDomChecks(page);

      if (options.visual) {
        visualStats.push(await collectVisualSlideStats(page, index, slideId));
      }

      slides.push({
        index,
        id: slideId,
        screenshot,
        checks
      });
    }

    const globalChecks: VerificationCheck[] = [
      {
        name: "expected-slide-count",
        status: metadata.expected === metadata.actual ? "pass" : "fail",
        message: `Expected ${metadata.expected} slide(s), found ${metadata.actual}.`
      },
      {
        name: "browser-console",
        status: consoleErrors.length ? "fail" : "pass",
        message: consoleErrors.length ? `${consoleErrors.length} browser console error(s).` : "No browser console errors."
      },
      {
        name: "asset-requests",
        status: requestFailures.length ? "fail" : "pass",
        message: requestFailures.length ? `${requestFailures.length} failed request(s).` : "No failed asset requests."
      }
    ];
    const visualQa = options.visual ? runVisualQa(visualStats) : undefined;
    const visualChecks = visualQa ? visualQaChecks(visualQa) : [];

    const allChecks = [...globalChecks, ...slides.flatMap((slide) => slide.checks), ...visualChecks];
    const summary = summarizeChecks(allChecks);
    const status = summary.failed > 0 ? "fail" : summary.warnings > 0 ? "warn" : "pass";
    const report: VerificationReport = {
      source: htmlPathOrUrl,
      generatedAt: new Date().toISOString(),
      expectedSlideCount: metadata.expected,
      actualSlideCount: metadata.actual,
      status,
      summary,
      consoleErrors,
      requestFailures,
      slides,
      visualQa
    };

    await fs.writeFile(path.join(outputDir, "verification-report.json"), `${JSON.stringify(report, null, 2)}\n`);
    if (visualQa) {
      await fs.writeFile(path.join(outputDir, "visual-qa-report.json"), `${JSON.stringify(visualQa, null, 2)}\n`);
    }
    await fs.writeFile(path.join(outputDir, "summary.txt"), humanSummary(report));

    return report;
  } finally {
    await browser.close();
  }
}

function summarizeChecks(checks: VerificationCheck[]): VerificationReport["summary"] {
  return checks.reduce(
    (summary, check) => {
      if (check.status === "pass") {
        summary.passed += 1;
      } else if (check.status === "warn") {
        summary.warnings += 1;
      } else {
        summary.failed += 1;
      }

      return summary;
    },
    { passed: 0, warnings: 0, failed: 0 }
  );
}

function humanSummary(report: VerificationReport): string {
  const lines = [
    `Verification status: ${report.status}`,
    `Slides: ${report.actualSlideCount}/${report.expectedSlideCount}`,
    `Checks: ${report.summary.passed} passed, ${report.summary.warnings} warnings, ${report.summary.failed} failed`
  ];

  for (const slide of report.slides) {
    const failed = slide.checks.filter((check) => check.status === "fail");
    const warned = slide.checks.filter((check) => check.status === "warn");

    if (failed.length || warned.length) {
      lines.push(`Slide ${slide.index + 1} (${slide.id}): ${failed.length} failed, ${warned.length} warnings`);
    }
  }

  if (report.visualQa) {
    lines.push(`Visual QA: ${report.visualQa.summary.visualWarnings} warning(s)`);

    for (const finding of report.visualQa.findings.slice(0, 8)) {
      lines.push(`- ${finding.slide ? `Slide ${finding.slide}: ` : ""}${finding.message}`);
      lines.push(`  Suggestion: ${finding.suggestion}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

async function adjustViewportForAspectRatio(page: import("playwright").Page): Promise<void> {
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
