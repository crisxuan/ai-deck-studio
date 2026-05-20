## Why

AI Deck Studio can already render structured `deck.json` into verified HTML/PDF/PNG/PPTX decks, but the current generation model still feels too much like `theme + fixed layout + changed copy`. Product and brand decks can look templated even when the content is different.

This change moves the project from a template renderer toward an effect-driven deck engine: each deck should have a planned visual system, each slide should have a distinct composition role, and automated QA should catch template repetition before delivery.

## What Changes

- Add deck-level visual-system planning so brief generation can express mood, density, image treatment, composition rhythm, typography intent, color intent, and QA priorities.
- Add slide-level layout variants so the same semantic slide type can render with different compositions instead of one fixed template.
- Route `brand-product` briefs to appropriate visual systems instead of defaulting every product deck to `premium-keynote`.
- Add or strengthen product/brand themes that are meaningfully distinct from generic keynote layouts.
- Add contact-sheet output so humans and agents can inspect full-deck rhythm quickly.
- Add visual QA checks for repeated layouts, low image footprint, weak visual anchors, excessive text density, empty-looking cards, and other symptoms of template-driven output.
- Add benchmark briefs and a repeatable benchmark command for regression testing visual rhythm and export stability.
- Prepare a path for reference-driven generation without copying reference content directly.

## Capabilities

### New Capabilities

- `effect-driven-generation`: Deck specs can describe a visual system and page-level composition variants, and brief generation can route themes/variants based on topic signals.
- `visual-quality-assurance`: Rendered decks can produce contact sheets and visual QA findings that detect template repetition and weak visual composition.
- `deck-benchmarking`: The project can run fixed benchmark briefs to compare visual rhythm, verification quality, and export stability across representative deck scenarios.
- `reference-driven-planning`: The system can capture reference visual intent for future generation without cloning the reference artifact.

### Modified Capabilities

- None. This is the first OpenSpec change; no archived baseline specs exist yet.

## Impact

- Schema: `deck.schema.json`, `src/core/schema.ts`
- Brief planning: `src/planner/`, `src/cli/index.ts`
- Rendering: `src/layouts/`, `src/renderer/`, `src/themes/`
- Verification: `src/verifier/`, `scripts/`
- Examples and benchmark fixtures: `examples/`, `benchmarks/`
- Documentation: `README.md`, `README.en.md`, `docs/`, `SKILL.md`
- CI may need to keep running `npm run build`, `npm test`, and representative showcase/benchmark checks.
