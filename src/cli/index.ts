#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { defaultOutputDir } from "../core/normalize.js";
import type { DeckSpec, ValidationResult } from "../core/schema.js";
import { readDeck, validateDeck } from "../core/validate.js";
import { exportDeck, type ExportFormat } from "../exporters/exportDeck.js";
import { renderDeck } from "../renderer/renderDeck.js";
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
      case "verify":
        await verifyCommand(args);
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

  const deck = await readDeck(deckPath);
  const validation = await validateDeck(deck);
  printValidation(validation);

  if (!validation.ok) {
    process.exitCode = 1;
    return;
  }

  const outputDir = String(flags.out ?? defaultOutputDir(deckPath));
  await fs.mkdir(outputDir, { recursive: true });
  const html = await renderDeck(deck);
  const outputPath = path.join(outputDir, "index.html");
  await fs.writeFile(outputPath, html);
  console.log(`Rendered ${outputPath}`);
}

async function verifyCommand(args: string[]): Promise<void> {
  const { positional, flags } = parseArgs(args);
  const htmlPath = positional[0];

  if (!htmlPath) {
    throw new Error("Usage: ai-deck verify <index.html|url> [--out report-dir]");
  }

  const report = await verifyDeck(htmlPath, {
    outputDir: flags.out ? String(flags.out) : undefined
  });

  console.log(`Verification ${report.status}: ${report.summary.passed} passed, ${report.summary.warnings} warnings, ${report.summary.failed} failed`);

  if (report.status === "fail") {
    process.exitCode = 1;
  }
}

async function exportCommand(args: string[]): Promise<void> {
  const { positional, flags } = parseArgs(args);
  const htmlPath = positional[0];
  const format = flags.format;

  if (!htmlPath || typeof format !== "string" || !isExportFormat(format)) {
    throw new Error("Usage: ai-deck export <index.html|url> --format pdf|png [--out output-path-or-dir]");
  }

  const artifacts = await exportDeck(htmlPath, {
    format,
    output: flags.out ? String(flags.out) : undefined
  });

  artifacts.forEach((artifact) => console.log(`Exported ${artifact}`));
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
  return value === "pdf" || value === "png";
}

function printHelp(): void {
  console.log(`AI Deck Studio

Usage:
  ai-deck init <directory>
  ai-deck validate <deck.json>
  ai-deck render <deck.json> [--out output-dir]
  ai-deck verify <index.html|url> [--out report-dir]
  ai-deck export <index.html|url> --format pdf|png [--out output-path-or-dir]
`);
}

void main();
