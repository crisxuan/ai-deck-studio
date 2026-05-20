# Contributing

Thanks for helping improve AI Deck Studio.

## Development

```bash
npm install
npm run build
npm test
npm run showcase
```

For renderer, theme, verifier, exporter, workflow, or user-facing behavior changes, keep the related OpenSpec change under `openspec/changes/` aligned before implementation.

## Pull Request Expectations

- Keep changes focused.
- Add or update examples when user-facing deck behavior changes.
- Run the narrowest relevant checks before opening a pull request.
- For visual changes, include a rendered deck, verification output, or contact sheet when possible.

## Generated Files

Do not commit local output directories such as `examples/**/output/`, `benchmarks/output/`, `artifacts/`, `showcase/`, `dist/`, or `node_modules/`.
