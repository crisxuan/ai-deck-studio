## ADDED Requirements

### Requirement: Deck visual system metadata

Deck specs MUST support optional visual-system metadata describing visual direction without invalidating existing decks that omit it.

#### Scenario: Existing deck omits visual system
- **WHEN** a valid deck does not include `visualSystem`
- **THEN** validation and rendering continue to work as before

#### Scenario: Deck includes visual system
- **WHEN** a deck includes `visualSystem` fields such as mood, density, image treatment, composition rhythm, color intent, typography intent, QA priorities, or reference
- **THEN** schema validation accepts the metadata and render/verify flows preserve normal behavior

### Requirement: Slide layout variants

Slide specs MUST support optional slide-level `layoutVariant` metadata so a semantic slide type can render with different visual compositions.

#### Scenario: Slide has layout variant
- **WHEN** a slide includes `layoutVariant`
- **THEN** the rendered slide exposes a stable variant class that theme CSS can target

#### Scenario: Slide omits layout variant
- **WHEN** a slide omits `layoutVariant`
- **THEN** the renderer uses the default composition for that slide type

### Requirement: Topic-aware brand product routing

Brief generation for `brand-product` MUST route to a suitable theme or visual system based on brief topic signals instead of always defaulting to one generic product theme.

#### Scenario: Brief is about appliances or kitchen products
- **WHEN** a `brand-product` brief contains signals such as fridge, refrigerator, kitchen, appliance, freezer, fresh keeping, 冰箱, 家电, 厨房, 厨居, 保鲜, 食材, or 母婴
- **THEN** the generated deck uses an appliance/product-showroom visual direction

#### Scenario: Brief is about luxury or beauty
- **WHEN** a `brand-product` brief contains signals such as luxury, fashion, beauty, jewelry, 奢侈, 高定, 珠宝, 香水, or 美妆
- **THEN** the generated deck uses a premium/luxury visual direction

#### Scenario: Brief is about AI or software
- **WHEN** a `brand-product` brief contains signals such as AI, agent, developer, software, platform, 代码, 开发者, 智能体, or 平台
- **THEN** the generated deck uses a technology-forward visual direction

### Requirement: Distinct product and brand examples

Product and brand examples MUST demonstrate different visual systems when their categories differ.

#### Scenario: Appliance and monitor examples coexist
- **WHEN** appliance and monitor/productivity examples are rendered
- **THEN** their first-screen visual language and at least three core slide compositions are visibly different
