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
3. Draft the story before slides:
   - thesis
   - narrative arc
   - role of each slide
4. Write `deck.json` against `deck.schema.json`.
5. Run validation:

   ```bash
   npm run validate -- path/to/deck.json
   ```

6. Render:

   ```bash
   npm run render -- path/to/deck.json
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
   ```

## Quality Bar

- Every deck has a clear audience, goal, thesis, and arc.
- Every slide has a purposeful role in the story.
- No visible text overflow in screenshots.
- No slide-level browser console errors.
- No body scrollbars in presentation view.
- Exported PDF/PNG files match the browser rendering closely.
