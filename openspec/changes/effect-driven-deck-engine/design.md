## Context

The existing renderer is intentionally schema-driven: semantic slide data is validated, converted into predictable HTML, styled by themes, verified by Playwright, and exported to PDF/PNG/PPTX. This gives the project stability, but also caps visual range when each slide type maps to one dominant DOM rhythm.

Recent project direction is explicitly effect-driven: the repo should not compete as a general HTML generator. Its reason to exist is to generate presentation-quality business, brand, product, review, and technical decks with visual QA and export reliability.

## Goals / Non-Goals

**Goals:**

- Preserve structured deck authoring and backward compatibility for existing `deck.json` files.
- Let a deck declare its visual direction beyond a single theme name.
- Let a slide declare a `layoutVariant` without changing its semantic slide type.
- Ensure brief generation chooses themes/visual systems based on topic signals.
- Add full-deck visual inspection through contact sheets and visual QA reports.
- Add benchmark briefs that make visual regression visible and repeatable.
- Keep HTML/PDF/PNG/PPTX export stable.

**Non-Goals:**

- Do not turn the project into a general HTML artifact generator.
- Do not replace the schema-driven architecture with ad hoc hand-written HTML per deck.
- Do not solve quality by adding many near-identical themes.
- Do not require AI image generation or external APIs.
- Do not make PPTX element-editable in this change; image-based PPTX export can remain.

## Decisions

### Visual System Is Deck-Level Metadata

Add optional `visualSystem` metadata to deck specs. It should be descriptive rather than a rigid enum so agents can express visual intent while existing decks remain valid.

Recommended fields:

- `mood`
- `density`
- `imageTreatment`
- `compositionRhythm`
- `colorIntent`
- `typographyIntent`
- `qaPriorities`
- `reference`

### Layout Variant Is Slide-Level Metadata

Add optional `layoutVariant` to base slide types. Renderers should emit variant classes such as `variant-product-plinth` or `variant-full-bleed-image`. Themes can then change composition without forcing new slide types for every layout.

### Keep Semantic Slide Types Stable

Do not create many new slide types just to vary visual appearance. Prefer:

```text
semantic slide type + layoutVariant + theme CSS
```

Only add a new slide type when the data model is genuinely different.

### Visual QA Should Start With Heuristics

Use lightweight, explainable checks before complex ML:

- DOM class and variant similarity
- image area ratio
- text length and card density
- large visual anchor detection
- repeated rhythm across adjacent slides
- empty-looking cards
- crop-risk heuristics where possible

### Benchmarks Are Product Pressure Tests

Benchmarks should use fixed briefs representing the project’s target value:

- brand planning
- product design introduction
- business review
- developer year-end review
- AI product launch

Each benchmark should render, verify, export representative artifacts, and produce a summary that can be compared over time.

### Reference Planning Is Non-Copying

Reference support should summarize visual rhythm, density, image use, and page roles. It must not copy proprietary or third-party content, logos, layouts verbatim, or text.

## Risks / Trade-offs

- More expressive visual metadata may increase schema complexity. Keep fields optional and backward compatible.
- Variant CSS can become hard to maintain if every theme implements every variant. Start with the highest-value themes and document fallback behavior.
- Heuristic visual QA can produce false positives. Findings should be warnings unless a rule catches a hard failure like broken images or overflow.
- Benchmarks can become slow if they render and export too much. Keep a fast default and allow heavier checks for release preparation.
- Reference-driven planning can accidentally drift toward copying. Keep the output at the level of abstract visual intent and QA priorities.
