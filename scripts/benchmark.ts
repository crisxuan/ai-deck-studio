import fs from "node:fs/promises";
import path from "node:path";
import { deckFromBrief } from "../src/planner/briefDeck.js";
import { readDeck, validateDeck } from "../src/core/validate.js";
import { renderDeck } from "../src/renderer/renderDeck.js";
import { exportPng } from "../src/exporters/exportPng.js";
import { generateContactSheet } from "../src/verifier/contactSheet.js";
import { verifyDeck } from "../src/verifier/verifyDeck.js";

type BenchmarkResult = {
  id: string;
  title: string;
  deckPath: string;
  htmlPath: string;
  verificationStatus: string;
  visualWarnings: number;
  pngCount: number;
  contactSheet: string;
};

const rootDir = process.cwd();
const benchmarkDir = path.join(rootDir, "benchmarks");
const briefsDir = path.join(benchmarkDir, "briefs");
const outputRoot = path.join(benchmarkDir, "output");

async function main(): Promise<void> {
  const briefPaths = await findBriefs();
  const results: BenchmarkResult[] = [];

  for (const briefPath of briefPaths) {
    const id = path.basename(briefPath, path.extname(briefPath));
    const outputDir = path.join(outputRoot, id);
    const deckPath = path.join(outputDir, "deck.json");
    const htmlPath = path.join(outputDir, "index.html");
    const brief = await fs.readFile(briefPath, "utf8");
    const deck = deckFromBrief(brief, {
      profile: profileForBrief(id, brief),
      title: titleForBrief(brief)
    });

    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(deckPath, `${JSON.stringify(deck, null, 2)}\n`);

    const savedDeck = await readDeck(deckPath);
    const validation = await validateDeck(savedDeck);
    if (!validation.ok) {
      const errors = validation.errors.map((error) => `${error.path}: ${error.message}`).join("\n");
      throw new Error(`Invalid benchmark deck ${deckPath}\n${errors}`);
    }

    await fs.writeFile(htmlPath, await renderDeck(savedDeck));
    const verification = await verifyDeck(htmlPath, {
      outputDir: path.join(outputDir, "verification"),
      visual: true
    });
    const pngs = await exportPng(htmlPath, { outputDir: path.join(outputDir, "png") });
    const contactSheet = await generateContactSheet(htmlPath, { outputPath: path.join(outputDir, "contact-sheet.png") });

    results.push({
      id,
      title: deck.title,
      deckPath,
      htmlPath,
      verificationStatus: verification.status,
      visualWarnings: verification.visualQa?.summary.visualWarnings ?? 0,
      pngCount: pngs.length,
      contactSheet
    });
  }

  await fs.mkdir(outputRoot, { recursive: true });
  await fs.writeFile(path.join(outputRoot, "summary.json"), `${JSON.stringify(results, null, 2)}\n`);
  await fs.writeFile(path.join(outputRoot, "summary.md"), renderSummary(results));

  const failures = results.filter((result) => result.verificationStatus === "fail");
  console.log(`Benchmarked ${results.length} brief(s).`);
  console.log(`Summary: ${path.join(outputRoot, "summary.md")}`);

  if (failures.length) {
    process.exitCode = 1;
  }
}

async function findBriefs(): Promise<string[]> {
  const entries = await fs.readdir(briefsDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => path.join(briefsDir, entry.name))
    .sort();
}

function profileForBrief(id: string, brief: string): string {
  const text = `${id}\n${brief}`.toLowerCase();

  if (/quarterly|business|经营|复盘|指标|kpi/.test(text)) {
    return "business";
  }

  if (/developer|architecture|程序员|架构|技术/.test(text)) {
    return "engineering";
  }

  return "brand-product";
}

function titleForBrief(brief: string): string {
  return (
    brief
      .split(/\r?\n/)
      .map((line) => line.replace(/^#+\s*/, "").trim())
      .find(Boolean)
      ?.slice(0, 100) ?? "Benchmark Deck"
  );
}

function renderSummary(results: BenchmarkResult[]): string {
  const lines = [
    "# Benchmark Summary",
    "",
    "| Brief | Verify | Visual warnings | PNG | Contact sheet |",
    "| --- | --- | ---: | ---: | --- |",
    ...results.map(
      (result) =>
        `| ${result.id} | ${result.verificationStatus} | ${result.visualWarnings} | ${result.pngCount} | ${path.relative(rootDir, result.contactSheet)} |`
    ),
    ""
  ];

  return lines.join("\n");
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});
