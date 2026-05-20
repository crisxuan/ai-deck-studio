## Why

AI Deck Studio is close to being useful as an open-source project, but the repository still has release-facing gaps: missing license, inconsistent package naming, dead preview links, no reliable CI on the remote, and bundled brand example images with unclear reuse rights.

This change prepares the repository for public release without changing the core deck engine behavior.

## What Changes

- Add standard open-source project files: license, contribution guide, security policy, changelog, and notice.
- Align the package name and metadata with the GitHub repository name `ai-deck-studio`.
- Update README links so public previews use currently working URLs instead of broken GitHub Pages links.
- Add CI for build, tests, and showcase generation.
- Make the GitHub Pages workflow manual-only until Pages is enabled in repository settings.
- Replace brand example product photos with open-source-safe illustrative SVG assets.
- Document trademark and sample asset boundaries.

## Impact

- Package metadata changes from `ppt-html-studio` to `ai-deck-studio`.
- README and project documentation become more open-source friendly.
- Remote workflow changes may require a GitHub App or token with workflow permission.
- Example visuals remain functional, but no longer claim to use official product images.
