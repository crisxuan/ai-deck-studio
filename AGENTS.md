# AI Project Workflow

## Source Of Truth

OpenSpec is the source of truth for non-trivial project changes.

For any feature, behavior change, architecture change, user-facing UI/interaction change, renderer/exporter change, verifier change, benchmark change, automation change, or risky bug fix:

1. Create or update an OpenSpec change under `openspec/changes/<change-name>/`.
2. Keep `proposal.md`, `design.md`, `tasks.md`, and `specs/` aligned.
3. Implement only after the OpenSpec artifacts are clear enough to execute.
4. Verify the implementation against the OpenSpec artifacts before completion.
5. Archive completed changes with OpenSpec.

Small typo, comment, or no-behavior config changes may skip OpenSpec, but still require verification.

## Current Active Change

The current strategic change is:

- `openspec/changes/effect-driven-deck-engine/`

Use this change as the source of truth for work related to visual-system routing, layout variants, visual QA, contact sheets, benchmarks, and reference-driven deck generation.

Do not create a competing plan for this effort. Update the OpenSpec artifacts instead.

## Superpowers Discipline

Use Superpowers-style execution discipline even when the plugin is not installed:

- clarify requirements before implementation when the request is ambiguous
- prefer TDD or test-first checks for features and bug fixes
- debug from root cause, not symptoms
- review before calling work complete
- verify behavior with real commands, browser screenshots, exported artifacts, logs, or reproducible steps

For this project, completion usually requires at least one of:

- `npm run build`
- `npm test`
- `npm run benchmark`
- `npm run showcase`
- `npm run verify -- <deck-html> --visual`
- `npm run contact-sheet -- <deck-html>`
- `npm run export -- <deck-html> --format png|pdf|pptx`

## gstack

Use gstack as the specialist review and verification layer when available.

Recommended review points:

- `/plan-ceo-review` for product direction, scope, and whether the deck engine is worth building
- `/plan-eng-review` for renderer architecture, schema compatibility, verifier boundaries, and test strategy
- `/plan-design-review` for layout variants, theme systems, and visual quality standards
- `/review` after implementation to find production-grade issues
- `/qa` for browser/user-flow verification of preview, rendered decks, visual QA, and exports
- `/ship` only after tests and verification are complete

Do not use gstack `/autoplan` to create a second main plan when an OpenSpec change already exists. Review and improve the OpenSpec artifacts instead.

## Work Scope

Only implement the current requested change.

Do not perform unrelated refactors, formatting churn, dependency upgrades, or broad cleanup unless the OpenSpec change explicitly includes them.

If implementation reveals that the scope must expand, stop and update the OpenSpec artifacts before continuing.

## Project Commands

- Install dependencies: `npm install`
- Build/typecheck: `npm run build`
- Test examples: `npm test`
- Run benchmark: `npm run benchmark`
- Build showcase: `npm run showcase`
- Render deck: `npm run render -- examples/tech-sharing/deck.json`
- Verify deck: `npm run verify -- examples/tech-sharing/output/index.html --visual`
- Contact sheet: `npm run contact-sheet -- examples/tech-sharing/output/index.html`
- Export PNG: `npm run export -- examples/tech-sharing/output/index.html --format png`
- Export PDF: `npm run export -- examples/tech-sharing/output/index.html --format pdf`
- Export PPTX: `npm run export -- examples/tech-sharing/output/index.html --format pptx`

## Testing Expectations

Before completion:

1. Run the narrowest relevant checks for the touched area.
2. For renderer/theme/layout/verifier changes, render and visually verify at least one representative deck.
3. For benchmark or global behavior changes, run `npm test` and `npm run benchmark`.
4. Report the commands and results in the final response.

## Completion Criteria

A task is complete only when:

- the code matches the active OpenSpec artifacts or the user-approved request
- relevant checks pass
- user-facing behavior has been verified when applicable
- visual output changes include screenshot/contact-sheet evidence when relevant
- gstack review/QA/security checks have been run or explicitly noted as unavailable when the change is product-critical, UI-heavy, or release-bound
- no unrelated changes were introduced
- the final response reports what changed, what was verified, and any remaining risk
