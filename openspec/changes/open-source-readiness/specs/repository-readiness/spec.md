## ADDED Requirements

### Requirement: Open-source repository metadata

The repository MUST include standard open-source metadata before public promotion.

#### Scenario: Contributor opens the repository
- **WHEN** a contributor lands on the project
- **THEN** they can find the license, contribution guide, security policy, changelog, and third-party notice.

### Requirement: Project naming consistency

The repository package metadata MUST align with the public project name.

#### Scenario: Package metadata is inspected
- **WHEN** a contributor opens `package.json`
- **THEN** the package name and repository metadata use `ai-deck-studio`.

### Requirement: Public preview links

README preview links MUST point to currently usable public URLs or clearly label optional Pages URLs.

#### Scenario: Reader clicks preview
- **WHEN** a reader clicks the primary preview link
- **THEN** it should not depend on disabled GitHub Pages settings.

### Requirement: Open-source-safe sample assets

Example decks MUST avoid bundling product photos or brand assets with unclear reuse rights.

#### Scenario: Brand examples are checked
- **WHEN** a brand example references local media
- **THEN** the media is either original illustrative material or clearly documented as user-replaceable sample content.

### Requirement: Non-failing default workflows

Repository workflows MUST avoid predictable failure on normal pushes.

#### Scenario: GitHub Pages is not enabled
- **WHEN** changes are pushed to `main`
- **THEN** the Pages workflow does not run automatically and fail solely because Pages settings are not enabled.
