## ADDED Requirements

### Requirement: Reference visual intent metadata

The deck planning model MUST support capturing reference visual intent without copying source content.

#### Scenario: Reference is provided
- **WHEN** a user provides a reference URL, screenshot, or project for a deck generation task
- **THEN** the resulting planning metadata can record abstract reference information such as composition rhythm, image footprint, density, and QA priorities

### Requirement: Reference use avoids direct cloning

Reference-driven planning MUST not copy proprietary content, logos, text, or page layouts verbatim.

#### Scenario: Reference is analyzed
- **WHEN** the system uses a reference to guide a deck
- **THEN** it records abstract visual direction rather than duplicating the reference artifact

### Requirement: Reference path can be deferred

Reference-driven generation MUST remain separable from earlier visual-system, layout-variant, visual-QA, and benchmark capabilities so those earlier capabilities can be implemented first.

#### Scenario: Earlier phases are implemented
- **WHEN** visual-system routing, layout variants, visual QA, and benchmarks are complete
- **THEN** reference-driven planning can be implemented as a later phase without blocking those earlier capabilities
