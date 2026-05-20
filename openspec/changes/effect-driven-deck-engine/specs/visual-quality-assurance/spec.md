## ADDED Requirements

### Requirement: Contact sheet generation

The CLI MUST be able to generate a contact sheet image for a rendered deck so agents and users can inspect full-deck rhythm at a glance.

#### Scenario: Contact sheet command runs on rendered deck
- **WHEN** `contact-sheet` is run against a rendered `index.html`
- **THEN** the project writes a contact sheet artifact to the deck output directory or requested output path

#### Scenario: Contact sheet includes all slides
- **WHEN** a deck has N slides
- **THEN** the contact sheet includes a thumbnail for every slide in order

### Requirement: Visual QA mode

The verifier MUST support visual QA findings in addition to hard correctness checks.

#### Scenario: Visual QA is requested
- **WHEN** the verifier runs with visual QA enabled
- **THEN** the report includes visual findings or an explicit empty visual-finding list

#### Scenario: Visual QA detects repeated layout rhythm
- **WHEN** adjacent slides use highly similar layout classes, variants, and DOM structure
- **THEN** visual QA reports a layout similarity warning

#### Scenario: Visual QA detects weak image footprint
- **WHEN** a brand or product deck has low image usage on image-expected slides
- **THEN** visual QA reports a low image footprint warning

#### Scenario: Visual QA detects excessive text density
- **WHEN** a slide contains too much visible text for its composition
- **THEN** visual QA reports a text density warning

#### Scenario: Visual QA detects weak visual anchor
- **WHEN** a slide lacks a dominant image, big number, contrast structure, strong quote, or comparable anchor
- **THEN** visual QA reports a weak visual anchor warning

### Requirement: Visual QA remains non-blocking by default

Visual QA findings MUST warn by default and MUST NOT fail the verifier unless the issue is already a hard correctness failure.

#### Scenario: Only visual warnings exist
- **WHEN** a deck has visual QA warnings but no broken images, overflow, console errors, or hard verification failures
- **THEN** the verifier status remains non-failing while reporting the warnings
