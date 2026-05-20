## 1. OpenSpec Onboarding

- [x] 1.1 Initialize OpenSpec for Codex under `.codex/` and `openspec/`.
- [x] 1.2 Add project-level `AGENTS.md` with OpenSpec, Superpowers, gstack, scope, and verification rules.
- [x] 1.3 Create `openspec/config.yaml` with the active change recorded.
- [x] 1.4 Create the `effect-driven-deck-engine` OpenSpec change.

## 2. Schema And Planning

- [x] 2.1 Add or verify deck-level `visualSystem` schema and TypeScript types.
- [x] 2.2 Add or verify slide-level `layoutVariant` schema and TypeScript types.
- [x] 2.3 Ensure rendered composition markup exposes stable variant classes.
- [x] 2.4 Ensure brief generation routes `brand-product` topics to distinct visual directions.
- [x] 2.5 Update docs for `visualSystem`, `layoutVariant`, and topic-aware routing.

## 3. Themes And Layout Variants

- [x] 3.1 Add or verify an appliance/product-showroom visual theme distinct from `premium-keynote`.
- [x] 3.2 Add at least three useful variants for core product/brand slide types.
- [x] 3.3 Update at least three example decks so they demonstrate different visual systems.
- [x] 3.4 Render representative examples and inspect screenshots/contact sheets.

## 4. Visual QA And Contact Sheets

- [x] 4.1 Add or verify `contact-sheet` CLI support.
- [x] 4.2 Add or verify visual QA report support in `verify --visual`.
- [x] 4.3 Check layout similarity or repeated rhythm.
- [x] 4.4 Check image footprint for product/brand decks.
- [x] 4.5 Check text density and weak visual anchors.
- [x] 4.6 Document visual QA warning semantics.

## 5. Benchmarks

- [x] 5.1 Add or verify benchmark briefs for the five representative scenarios.
- [x] 5.2 Add or verify `npm run benchmark`.
- [x] 5.3 Ensure benchmark output reports render, verify, artifact, and visual review locations.
- [x] 5.4 Keep benchmark output ignored if it is generated.

## 6. Reference-Driven Planning

- [x] 6.1 Define reference metadata shape in `visualSystem` or planning docs.
- [x] 6.2 Add a deferred implementation plan for `--reference` input.
- [x] 6.3 Ensure docs state that reference use extracts abstract visual rhythm and must not clone source content.

## 7. Verification

- [x] 7.1 Run `npm run build`.
- [x] 7.2 Run `npm test`.
- [x] 7.3 Run `npm run benchmark`.
- [x] 7.4 Render and verify a representative product/brand deck with `--visual`.
- [x] 7.5 Generate a contact sheet for the representative deck.
- [x] 7.6 Confirm exporter behavior was not changed; benchmark exercised PNG export.
