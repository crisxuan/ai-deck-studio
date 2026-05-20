import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { readDeck, validateDeck } from "../src/core/validate.js";
import { renderDeck } from "../src/renderer/renderDeck.js";

const rootDir = process.cwd();
const examplesDir = path.join(rootDir, "examples");

async function main(): Promise<void> {
  const deckPaths = await findExampleDecks();

  assert.ok(deckPaths.length >= 1, "expected at least one example deck");

  for (const deckPath of deckPaths) {
    const deck = await readDeck(deckPath);
    const validation = await validateDeck(deck);

    assert.deepEqual(
      validation.errors,
      [],
      `expected ${path.relative(rootDir, deckPath)} to validate without schema errors`
    );

    const html = await renderDeck(deck);
    assert.match(html, /<section class="slide"/, `expected ${deckPath} to render slide markup`);
    assert.match(html, new RegExp(`data-slide-count="${deck.slides.length}"`), `expected ${deckPath} to include slide count metadata`);
  }

  await assertMediaFeatureFixture();
  console.log(`Validated and rendered ${deckPaths.length} example deck(s).`);
}

async function findExampleDecks(): Promise<string[]> {
  const entries = await fs.readdir(examplesDir, { withFileTypes: true });
  const deckPaths: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const deckPath = path.join(examplesDir, entry.name, "deck.json");

    try {
      await fs.access(deckPath);
      deckPaths.push(deckPath);
    } catch {
      // Ignore example folders without deck specs.
    }
  }

  return deckPaths.sort();
}

async function assertMediaFeatureFixture(): Promise<void> {
  const deck = await readDeck(path.join(examplesDir, "benq-rd280u-design-zh", "deck.json"));
  const html = await renderDeck(deck);

  assert.match(html, /media-feature-layout/, "expected RD280U example to use the media-feature layout");
  assert.match(html, /rd280u-hero\.jpg/, "expected RD280U example to render its local product image");
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});
