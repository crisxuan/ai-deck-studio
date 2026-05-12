import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Ajv, type AnySchema, type ErrorObject } from "ajv/dist/ajv.js";
import type { DeckSpec, SlideSpec, ValidationIssue, ValidationResult } from "./schema.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

async function loadSchema(): Promise<unknown> {
  const candidates = [
    path.resolve(process.cwd(), "deck.schema.json"),
    path.resolve(currentDir, "../../deck.schema.json"),
    path.resolve(currentDir, "../deck.schema.json")
  ];

  for (const candidate of candidates) {
    try {
      return JSON.parse(await fs.readFile(candidate, "utf8"));
    } catch {
      // Try the next likely location.
    }
  }

  throw new Error("Unable to locate deck.schema.json");
}

export async function readDeck(deckPath: string): Promise<DeckSpec> {
  const raw = await fs.readFile(deckPath, "utf8");
  return JSON.parse(raw) as DeckSpec;
}

export async function validateDeck(deck: unknown): Promise<ValidationResult> {
  const schema = await loadSchema();
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validate = ajv.compile(schema as AnySchema);
  const valid = validate(deck);
  const errors = valid ? [] : formatAjvErrors(validate.errors ?? []);
  const warnings = isDeckLike(deck) ? contentWarnings(deck) : [];

  return {
    ok: errors.length === 0,
    errors,
    warnings
  };
}

function formatAjvErrors(errors: ErrorObject[]): ValidationIssue[] {
  return errors.map((error) => ({
    level: "error",
    path: error.instancePath || "/",
    message: error.message ?? "Invalid deck spec"
  }));
}

function isDeckLike(value: unknown): value is DeckSpec {
  return Boolean(value && typeof value === "object" && Array.isArray((value as DeckSpec).slides));
}

function contentWarnings(deck: DeckSpec): ValidationIssue[] {
  const warnings: ValidationIssue[] = [];
  const ids = new Set<string>();

  deck.slides.forEach((slide, index) => {
    const pathPrefix = `/slides/${index}`;

    if (ids.has(slide.id)) {
      warnings.push(warning(`${pathPrefix}/id`, `Duplicate slide id "${slide.id}".`));
    }

    ids.add(slide.id);
    warnForSlide(slide, pathPrefix, warnings);
  });

  if (deck.slides.length > 18) {
    warnings.push(warning("/slides", "Decks longer than 18 slides are harder to verify visually in one pass."));
  }

  return warnings;
}

function warnForSlide(slide: SlideSpec, pathPrefix: string, warnings: ValidationIssue[]): void {
  if ("title" in slide) {
    checkText(slide.title, 110, `${pathPrefix}/title`, "Title", warnings);
  }

  if (slide.type === "key-insight") {
    checkText(slide.headline, 110, `${pathPrefix}/headline`, "Headline", warnings);
    checkPoints(slide.points, `${pathPrefix}/points`, warnings, 3, 5, 90);
    checkText(slide.evidence, 160, `${pathPrefix}/evidence`, "Evidence", warnings);
  }

  if (slide.type === "two-column") {
    slide.columns.forEach((column, index) => {
      checkText(column.heading, 80, `${pathPrefix}/columns/${index}/heading`, "Column heading", warnings);
      checkText(column.body, 220, `${pathPrefix}/columns/${index}/body`, "Column body", warnings);
      checkPoints(column.points, `${pathPrefix}/columns/${index}/points`, warnings, 2, 4, 90);
    });
  }

  if (slide.type === "comparison") {
    [slide.left, slide.right].forEach((side, index) => {
      const sidePath = index === 0 ? "left" : "right";
      checkPoints(side.points, `${pathPrefix}/${sidePath}/points`, warnings, 2, 4, 90);
    });
  }

  if (slide.type === "code") {
    const lines = slide.code.split("\n");
    if (lines.length > 18) {
      warnings.push(warning(`${pathPrefix}/code`, "Code slides are most readable with 18 lines or fewer."));
    }

    const longLine = lines.find((line) => line.length > 96);
    if (longLine) {
      warnings.push(warning(`${pathPrefix}/code`, "A code line is longer than 96 characters and may wrap poorly."));
    }
  }
}

function checkText(
  value: string | undefined,
  maxLength: number,
  path: string,
  label: string,
  warnings: ValidationIssue[]
): void {
  if (value && value.length > maxLength) {
    warnings.push(warning(path, `${label} is ${value.length} characters; recommended max is ${maxLength}.`));
  }
}

function checkPoints(
  points: string[] | undefined,
  path: string,
  warnings: ValidationIssue[],
  min: number,
  max: number,
  maxPointLength: number
): void {
  if (!points) {
    return;
  }

  if (points.length < min || points.length > max) {
    warnings.push(warning(path, `Recommended point count is ${min}-${max}; found ${points.length}.`));
  }

  points.forEach((point, index) => {
    if (point.length > maxPointLength) {
      warnings.push(warning(`${path}/${index}`, `Point is ${point.length} characters; recommended max is ${maxPointLength}.`));
    }
  });
}

function warning(path: string, message: string): ValidationIssue {
  return {
    level: "warning",
    path,
    message
  };
}
