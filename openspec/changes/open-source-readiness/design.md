## Approach

Keep this change intentionally small and repository-facing. Do not refactor renderer, verifier, or exporter internals.

## Decisions

- Use the MIT License because the project is an early-stage developer tool and benefits from permissive reuse.
- Keep the CLI binary name `ai-deck` while changing the npm package name to `ai-deck-studio`.
- Use GitHub HTML Preview as the primary public preview URL until GitHub Pages is enabled and confirmed working.
- Keep the Pages workflow in the repository, but make it `workflow_dispatch` only so it does not produce failing checks on every push while Pages is disabled.
- Keep referential BenQ and Haier example decks, but replace bundled official-looking product photos with original SVG concept illustrations and add a notice about trademarks.

## Verification

- Run `npm run build`.
- Run `npm test`.
- Run `npm run showcase`.
- Render or verify at least one updated brand/product example if asset references changed.
- Confirm README preview URLs do not point to known 404 GitHub Pages URLs as the primary links.
