# Architecture

AI Deck Studio separates the generation workflow into four layers:

1. Deck planning: the agent clarifies audience, goal, thesis, and narrative arc.
2. Deck spec: the agent writes `deck.json` against `deck.schema.json`.
3. Rendering: TypeScript layouts and CSS themes produce static HTML.
4. Verification and export: Playwright screenshots check quality, then PDF/PNG artifacts are produced.

The model should not hand-author HTML for a deck. HTML is an output artifact generated from a structured spec.

## Main Modules

- `src/core`: schema types, validation, normalization, output helpers.
- `src/renderer`: HTML shell, slide dispatch, static asset embedding.
- `src/layouts`: one renderer per layout contract.
- `src/themes`: base CSS and production themes.
- `src/runtime`: keyboard navigation for the static HTML deck.
- `src/verifier`: Playwright screenshot capture and DOM quality checks.
- `src/exporters`: PDF and PNG export from rendered HTML.
- `src/cli`: command-line interface for agents and developers.

## Data Flow

```txt
deck.json
  -> validateDeck
  -> renderDeck
  -> output/index.html
  -> verifyDeck
  -> verification report and screenshots
  -> export PDF/PNG
```
