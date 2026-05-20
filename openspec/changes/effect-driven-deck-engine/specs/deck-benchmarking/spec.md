## ADDED Requirements

### Requirement: Fixed benchmark briefs

The project MUST include fixed benchmark briefs covering representative target deck scenarios.

#### Scenario: Benchmark fixtures are present
- **WHEN** a contributor opens the benchmark directory
- **THEN** it contains briefs for brand planning, product design introduction, business review, developer year-end review, and AI product launch

### Requirement: Benchmark command

The project MUST provide a benchmark command that renders benchmark briefs and records verification/export results.

#### Scenario: Benchmark command runs
- **WHEN** `npm run benchmark` is executed
- **THEN** the command processes the fixed benchmark briefs and writes a summary report

#### Scenario: Benchmark report captures outcomes
- **WHEN** benchmark output is produced
- **THEN** it includes each benchmark deck name, render status, verification status, and generated artifact locations

### Requirement: Benchmark supports visual regression review

Benchmark output MUST make it possible to inspect visual rhythm changes across runs.

#### Scenario: Benchmark deck is rendered
- **WHEN** a benchmark deck is generated
- **THEN** screenshots or contact sheet artifacts are available for visual review
