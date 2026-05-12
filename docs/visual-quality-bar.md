# Visual Quality Bar

Verification is part of generation, not a final cosmetic pass.

## MVP Checks

- Page renders without browser console errors.
- Local assets are not missing.
- Slide count matches the deck spec.
- Body-level scrollbars are absent in presentation mode.
- Active slide is not blank.
- Obvious text overflow is not present.
- Text remains above the minimum readable font size.
- Basic text contrast is sampled.

## What To Do On Failure

- If schema validation fails, repair `deck.json`.
- If text overflows, shorten the slide or change layout.
- If screenshots are blank, inspect renderer/runtime first.
- If export differs from browser rendering, inspect print-mode CSS.
