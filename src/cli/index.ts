#!/usr/bin/env node
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { defaultOutputDir } from "../core/normalize.js";
import type { DeckSpec, ValidationResult } from "../core/schema.js";
import { readDeck, validateDeck } from "../core/validate.js";
import { exportDeck, type ExportFormat } from "../exporters/exportDeck.js";
import { deckFromBrief } from "../planner/briefDeck.js";
import { renderDeck } from "../renderer/renderDeck.js";
import { generateContactSheet } from "../verifier/contactSheet.js";
import { verifyDeck } from "../verifier/verifyDeck.js";

type Flags = Record<string, string | boolean>;

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);

  try {
    switch (command) {
      case "init":
        await initCommand(args);
        break;
      case "validate":
        await validateCommand(args);
        break;
      case "render":
        await renderCommand(args);
        break;
      case "preview":
        await previewCommand(args);
        break;
      case "brief":
        await briefCommand(args);
        break;
      case "verify":
        await verifyCommand(args);
        break;
      case "contact-sheet":
        await contactSheetCommand(args);
        break;
      case "export":
        await exportCommand(args);
        break;
      case "help":
      case "--help":
      case "-h":
      case undefined:
        printHelp();
        break;
      default:
        throw new Error(`Unknown command "${command}".`);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

async function initCommand(args: string[]): Promise<void> {
  const target = args[0];

  if (!target) {
    throw new Error("Usage: ai-deck init <directory>");
  }

  const targetDir = path.resolve(target);
  await fs.mkdir(path.join(targetDir, "output"), { recursive: true });
  const deckPath = path.join(targetDir, "deck.json");

  let deckExists = true;
  try {
    await fs.access(deckPath);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      deckExists = false;
    } else {
      throw error;
    }
  }

  if (deckExists) {
    throw new Error(`Refusing to overwrite existing ${deckPath}`);
  }

  const deck: DeckSpec = {
    version: "0.1.0",
    title: "Untitled Deck",
    audience: "stakeholders",
    goal: "explain the core idea and align on next steps",
    tone: "clear, credible, pragmatic",
    theme: "consulting-clean",
    aspectRatio: "16:9",
    language: "en",
    story: {
      thesis: "A clear story makes the deck easier to trust and act on.",
      arc: ["Frame the situation.", "Explain the key insight.", "Close with the decision needed."]
    },
    slides: [
      {
        id: "cover",
        type: "cover",
        title: "Untitled Deck",
        subtitle: "Replace this starter spec with your narrative."
      },
      {
        id: "core-insight",
        type: "key-insight",
        eyebrow: "Core insight",
        headline: "Start with the story, then let the renderer handle consistency.",
        points: ["Clarify the audience.", "Write a structured deck spec.", "Render and verify before delivery."]
      },
      {
        id: "close",
        type: "closing",
        title: "Next step",
        takeaway: "Edit deck.json, render, verify, and export."
      }
    ]
  };

  await fs.writeFile(deckPath, `${JSON.stringify(deck, null, 2)}\n`);
  console.log(`Created ${deckPath}`);
}

async function validateCommand(args: string[]): Promise<void> {
  const deckPath = args[0];

  if (!deckPath) {
    throw new Error("Usage: ai-deck validate <deck.json>");
  }

  const deck = await readDeck(deckPath);
  const result = await validateDeck(deck);
  printValidation(result);

  if (!result.ok) {
    process.exitCode = 1;
  }
}

async function renderCommand(args: string[]): Promise<void> {
  const { positional, flags } = parseArgs(args);
  const deckPath = positional[0];

  if (!deckPath) {
    throw new Error("Usage: ai-deck render <deck.json> [--out output-dir]");
  }

  const outputDir = String(flags.out ?? defaultOutputDir(deckPath));
  const outputPath = await renderDeckFile(deckPath, outputDir);
  console.log(`Rendered ${outputPath}`);
}

async function previewCommand(args: string[]): Promise<void> {
  const { positional, flags } = parseArgs(args);
  const deckPath = positional[0];

  if (!deckPath) {
    throw new Error("Usage: ai-deck preview <deck.json> [--out output-dir] [--port 4173] [--watch]");
  }

  const outputDir = String(flags.out ?? defaultOutputDir(deckPath));
  const port = Number(flags.port ?? 4173);
  const outputPath = await renderDeckFile(deckPath, outputDir);
  console.log(`Rendered ${outputPath}`);

  if (flags.watch) {
    watchDeck(deckPath, outputDir);
  }

  await serveDirectory(outputDir, port);
  await new Promise(() => undefined);
}

async function briefCommand(args: string[]): Promise<void> {
  const { positional, flags } = parseArgs(args);
  const briefPath = positional[0];

  if (!briefPath) {
    throw new Error("Usage: ai-deck brief <brief.md|txt> --out directory [--profile brand-product|engineering|business] [--title title] [--reference url-or-path]");
  }

  const brief = await fs.readFile(briefPath, "utf8");
  const deck = deckFromBrief(brief, flags);
  const outputDir = String(flags.out ?? path.join(path.dirname(path.resolve(briefPath)), slugify(deck.title)));
  const deckPath = path.join(outputDir, "deck.json");

  if (await exists(deckPath)) {
    throw new Error(`Refusing to overwrite existing ${deckPath}`);
  }

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(deckPath, `${JSON.stringify(deck, null, 2)}\n`);
  console.log(`Created ${deckPath}`);
}

async function verifyCommand(args: string[]): Promise<void> {
  const { positional, flags } = parseArgs(args);
  const htmlPath = positional[0];

  if (!htmlPath) {
    throw new Error("Usage: ai-deck verify <index.html|url> [--out report-dir] [--visual]");
  }

  const report = await verifyDeck(htmlPath, {
    outputDir: flags.out ? String(flags.out) : undefined,
    visual: Boolean(flags.visual)
  });

  console.log(`Verification ${report.status}: ${report.summary.passed} passed, ${report.summary.warnings} warnings, ${report.summary.failed} failed`);
  if (report.visualQa) {
    console.log(`Visual QA ${report.visualQa.status}: ${report.visualQa.summary.visualWarnings} warning(s)`);
  }

  if (report.status === "fail") {
    process.exitCode = 1;
  }
}

async function contactSheetCommand(args: string[]): Promise<void> {
  const { positional, flags } = parseArgs(args);
  const htmlPath = positional[0];

  if (!htmlPath) {
    throw new Error("Usage: ai-deck contact-sheet <index.html|url> [--out contact-sheet.png|output-dir]");
  }

  const outputPath = flags.out ? contactSheetOutputPath(String(flags.out)) : undefined;
  const artifact = await generateContactSheet(htmlPath, { outputPath });
  console.log(`Generated ${artifact}`);
}

async function exportCommand(args: string[]): Promise<void> {
  const { positional, flags } = parseArgs(args);
  const htmlPath = positional[0];
  const format = flags.format;

  if (!htmlPath || typeof format !== "string" || !isExportFormat(format)) {
    throw new Error("Usage: ai-deck export <index.html|url> --format pdf|png|pptx [--out output-path-or-dir]");
  }

  const artifacts = await exportDeck(htmlPath, {
    format,
    output: flags.out ? String(flags.out) : undefined
  });

  artifacts.forEach((artifact) => console.log(`Exported ${artifact}`));
}

async function renderDeckFile(deckPath: string, outputDir: string): Promise<string> {
  const deck = await readDeck(deckPath);
  const validation = await validateDeck(deck);
  printValidation(validation);

  if (!validation.ok) {
    throw new Error(`Cannot render invalid deck ${deckPath}`);
  }

  await fs.mkdir(outputDir, { recursive: true });
  const html = await renderDeck(deck);
  const outputPath = path.join(outputDir, "index.html");
  await fs.writeFile(outputPath, html);
  return outputPath;
}

function watchDeck(deckPath: string, outputDir: string): void {
  let timer: NodeJS.Timeout | undefined;
  const absoluteDeckPath = path.resolve(deckPath);

  try {
    const watcher = fs.watch(absoluteDeckPath);

    (async () => {
      for await (const event of watcher) {
        if (event.eventType !== "change") {
          continue;
        }

        clearTimeout(timer);
        timer = setTimeout(() => {
          renderDeckFile(absoluteDeckPath, outputDir)
            .then((outputPath) => console.log(`Re-rendered ${outputPath}`))
            .catch((error: unknown) => console.error(error instanceof Error ? error.message : String(error)));
        }, 120);
      }
    })().catch((error: unknown) => console.error(error instanceof Error ? error.message : String(error)));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
  }
}

async function serveDirectory(rootDir: string, port: number): Promise<http.Server> {
  const root = path.resolve(rootDir);
  const server = http.createServer(async (request, response) => {
    try {
      const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
      const requestPath = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
      const filePath = path.resolve(root, `.${decodeURIComponent(requestPath)}`);
      const relativePath = path.relative(root, filePath);

      if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }

      const file = await fs.readFile(filePath);
      response.writeHead(200, { "Content-Type": contentType(filePath) });
      response.end(file);
    } catch {
      response.writeHead(404);
      response.end("Not found");
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, () => resolve());
  });

  console.log(`Preview server running at http://localhost:${port}`);
  return server;
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function contentType(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".html") {
    return "text/html; charset=utf-8";
  }

  if (extension === ".css") {
    return "text/css; charset=utf-8";
  }

  if (extension === ".js") {
    return "text/javascript; charset=utf-8";
  }

  if (extension === ".png") {
    return "image/png";
  }

  if (extension === ".jpg" || extension === ".jpeg") {
    return "image/jpeg";
  }

  if (extension === ".svg") {
    return "image/svg+xml";
  }

  return "application/octet-stream";
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "deck"
  );
}

function contactSheetOutputPath(value: string): string {
  return path.extname(value).toLowerCase() === ".png" ? value : path.join(value, "contact-sheet.png");
}

function parseArgs(args: string[]): { positional: string[]; flags: Flags } {
  const positional: string[] = [];
  const flags: Flags = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg.startsWith("--")) {
      const [key, inlineValue] = arg.slice(2).split("=", 2);
      const next = args[index + 1];

      if (inlineValue !== undefined) {
        flags[key] = inlineValue;
      } else if (next && !next.startsWith("--")) {
        flags[key] = next;
        index += 1;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(arg);
    }
  }

  return { positional, flags };
}

function printValidation(result: ValidationResult): void {
  if (result.errors.length === 0 && result.warnings.length === 0) {
    console.log("Validation passed.");
    return;
  }

  for (const issue of [...result.errors, ...result.warnings]) {
    console.log(`${issue.level.toUpperCase()} ${issue.path}: ${issue.message}`);
  }

  if (result.errors.length === 0) {
    console.log("Validation passed with warnings.");
  }
}

function isExportFormat(value: string): value is ExportFormat {
  return value === "pdf" || value === "png" || value === "pptx";
}

function printHelp(): void {
  console.log(`AI Deck Studio

Usage:
  ai-deck init <directory>
  ai-deck brief <brief.md|txt> --out directory [--profile brand-product|engineering|business] [--reference url-or-path]
  ai-deck validate <deck.json>
  ai-deck render <deck.json> [--out output-dir]
  ai-deck preview <deck.json> [--out output-dir] [--port 4173] [--watch]
  ai-deck verify <index.html|url> [--out report-dir] [--visual]
  ai-deck contact-sheet <index.html|url> [--out contact-sheet.png|output-dir]
  ai-deck export <index.html|url> --format pdf|png|pptx [--out output-path-or-dir]
`);
}

void main();
