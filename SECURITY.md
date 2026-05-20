# Security Policy

AI Deck Studio is currently an early-stage local-first project.

## Reporting

Please report security issues privately by opening a GitHub security advisory or contacting the repository owner. Do not publish exploit details before there is a reasonable fix or mitigation.

## Scope

Security-sensitive areas include:

- HTML rendering and escaping
- local preview server behavior
- file path handling for render, verify, and export commands
- generated deck assets
- CI and GitHub Pages workflows

Do not run untrusted deck specs or assets in a privileged environment.
