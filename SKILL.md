# AI Deck Studio Skill

Use this skill when creating, repairing, verifying, or exporting structured presentation decks with AI Deck Studio.

## Operating Principle

Do not write raw slide HTML for deck content. Write or repair `deck.json`, validate it, render it, verify screenshots, and export delivery artifacts.

## Required Workflow

1. Clarify or infer:
   - audience
   - deck goal
   - slide count
   - delivery style
   - export format
2. Choose a default theme when the user is vague:
   - business deck: `consulting-clean`
   - technical talk: `tech-dark`
   - social carousel: `xiaohongshu-editorial`
   - architecture keynote: `technical-blueprint`
   - founder or investor pitch: `founder-editorial`
   - KPI-heavy business review: `executive-dashboard`
   - minimal executive brief: `minimal`
   - editorial narrative: `editorial`
   - luxury or premium launch: `luxury`
   - formal enterprise deck: `corporate`
   - dark data-heavy deck: `dashboard`
   - modular product story: `bento`
   - glassy modern tech deck: `glassmorphism`
   - expressive campaign deck: `neobrutalism`
   - futuristic AI launch: `futuristic`
   - research or education deck: `paper`
3. Draft the story before slides:
   - thesis
   - narrative arc
   - role of each slide
4. Write `deck.json` against `deck.schema.json`.
   - For brand/product decks, prefer `media-feature` or `media` fields with licensed, user-provided, or original illustrative images.
   - Do not commit third-party product photos or brand assets unless their redistribution rights are clear.
5. Run validation:

   ```bash
   npm run validate -- path/to/deck.json
   ```

6. Render:

   ```bash
   npm run render -- path/to/deck.json
   ```

   For local iteration, use preview mode:

   ```bash
   npm run preview -- path/to/deck.json --watch
   ```

7. Verify:

   ```bash
   npm run verify -- path/to/output/index.html
   ```

8. Repair failures in this order:
   - deck content length
   - layout implementation
   - theme CSS
   - verifier false positives
9. Export only after verification is acceptable:

   ```bash
   npm run export -- path/to/output/index.html --format pdf
   npm run export -- path/to/output/index.html --format png
   npm run export -- path/to/output/index.html --format pptx
   ```

10. For a visual gallery or demo handoff, build the showcase:

   ```bash
   npm run showcase
   ```

   Then open `showcase/index.html`.

## Quality Bar

- Every deck has a clear audience, goal, thesis, and arc.
- Every slide has a purposeful role in the story.
- No visible text overflow in screenshots.
- No empty content placeholders or broken visible images.
- No slide-level browser console errors.
- No body scrollbars in presentation view.
- Exported PDF/PNG/PPTX files match the browser rendering closely.
- Showcase pages use live rendered decks, not mock screenshots.
- Speaker notes stay hidden from the audience view and are available through `S` presenter mode or `N` notes drawer.
