export const THEMES = [
  "consulting-clean",
  "tech-dark",
  "xiaohongshu-editorial",
  "premium-keynote",
  "technical-blueprint",
  "founder-editorial",
  "executive-dashboard",
  "minimal",
  "editorial",
  "luxury",
  "corporate",
  "dashboard",
  "bento",
  "glassmorphism",
  "neobrutalism",
  "futuristic",
  "paper"
] as const;
export const ASPECT_RATIOS = ["16:9", "4:3", "3:4"] as const;
export const SLIDE_TYPES = [
  "cover",
  "agenda",
  "section",
  "key-insight",
  "two-column",
  "comparison",
  "timeline",
  "metric-grid",
  "code",
  "closing",
  "narrative-opener",
  "hero-statement",
  "product-showcase",
  "market-map",
  "system-architecture",
  "data-story",
  "tension-resolution",
  "quote-break",
  "final-ask"
] as const;

export type ThemeName = (typeof THEMES)[number];
export type AspectRatio = (typeof ASPECT_RATIOS)[number];
export type SlideType = (typeof SLIDE_TYPES)[number];

export type StoryPlan = {
  thesis: string;
  arc: string[];
};

export type DeckAlternate = {
  label: string;
  language?: string;
  href: string;
};

export type DeckSpec = {
  version: string;
  title: string;
  audience: string;
  goal: string;
  tone?: string;
  theme: ThemeName;
  aspectRatio: AspectRatio;
  language?: string;
  alternates?: DeckAlternate[];
  story?: StoryPlan;
  slides: SlideSpec[];
};

export type BaseSlide = {
  id: string;
  type: SlideType;
  presenterNotes?: string;
  visualIntent?: string;
};

export type CoverSlide = BaseSlide & {
  type: "cover";
  eyebrow?: string;
  title: string;
  subtitle?: string;
  meta?: string;
};

export type AgendaSlide = BaseSlide & {
  type: "agenda";
  title: string;
  subtitle?: string;
  items: string[];
};

export type SectionSlide = BaseSlide & {
  type: "section";
  eyebrow?: string;
  title: string;
  kicker?: string;
};

export type KeyInsightSlide = BaseSlide & {
  type: "key-insight";
  eyebrow?: string;
  headline: string;
  points?: string[];
  evidence?: string;
};

export type TextColumn = {
  heading: string;
  body?: string;
  points?: string[];
};

export type TwoColumnSlide = BaseSlide & {
  type: "two-column";
  title: string;
  subtitle?: string;
  columns: [TextColumn, TextColumn];
};

export type ComparisonSide = {
  label: string;
  headline?: string;
  points: string[];
};

export type ComparisonSlide = BaseSlide & {
  type: "comparison";
  title: string;
  subtitle?: string;
  left: ComparisonSide;
  right: ComparisonSide;
};

export type TimelineEvent = {
  label: string;
  title: string;
  description?: string;
};

export type TimelineSlide = BaseSlide & {
  type: "timeline";
  title: string;
  subtitle?: string;
  events: TimelineEvent[];
};

export type Metric = {
  label: string;
  value: string;
  detail?: string;
};

export type MetricGridSlide = BaseSlide & {
  type: "metric-grid";
  title: string;
  subtitle?: string;
  metrics: Metric[];
};

export type CodeSlide = BaseSlide & {
  type: "code";
  title: string;
  subtitle?: string;
  language?: string;
  code: string;
  caption?: string;
};

export type ClosingSlide = BaseSlide & {
  type: "closing";
  title: string;
  subtitle?: string;
  takeaway?: string;
  nextSteps?: string[];
  contact?: string;
};

export type MiniMetric = {
  label: string;
  value: string;
  detail?: string;
};

export type FeatureCard = {
  title: string;
  description: string;
};

export type NarrativeOpenerSlide = BaseSlide & {
  type: "narrative-opener";
  eyebrow?: string;
  title: string;
  subtitle?: string;
  chips?: string[];
  stat?: MiniMetric;
};

export type HeroStatementSlide = BaseSlide & {
  type: "hero-statement";
  eyebrow?: string;
  headline: string;
  subheadline?: string;
  proofs?: MiniMetric[];
};

export type ProductShowcaseSlide = BaseSlide & {
  type: "product-showcase";
  title: string;
  subtitle?: string;
  productName: string;
  tagline?: string;
  features: FeatureCard[];
  metrics?: MiniMetric[];
};

export type MarketSegment = {
  label: string;
  description: string;
  signal?: string;
};

export type MarketMapSlide = BaseSlide & {
  type: "market-map";
  title: string;
  subtitle?: string;
  insight?: string;
  segments: MarketSegment[];
};

export type ArchitectureLayer = {
  label: string;
  description: string;
  tools?: string[];
};

export type SystemArchitectureSlide = BaseSlide & {
  type: "system-architecture";
  title: string;
  subtitle?: string;
  callout?: string;
  layers: ArchitectureLayer[];
};

export type DataStorySlide = BaseSlide & {
  type: "data-story";
  title: string;
  subtitle?: string;
  headline: string;
  takeaway?: string;
  metrics: MiniMetric[];
};

export type TensionResolutionSlide = BaseSlide & {
  type: "tension-resolution";
  title: string;
  subtitle?: string;
  tension: ComparisonSide;
  resolution: ComparisonSide;
};

export type QuoteBreakSlide = BaseSlide & {
  type: "quote-break";
  eyebrow?: string;
  quote: string;
  attribution?: string;
  context?: string;
};

export type FinalAskSlide = BaseSlide & {
  type: "final-ask";
  title: string;
  subtitle?: string;
  ask: string;
  actions?: string[];
  contact?: string;
};

export type SlideSpec =
  | CoverSlide
  | AgendaSlide
  | SectionSlide
  | KeyInsightSlide
  | TwoColumnSlide
  | ComparisonSlide
  | TimelineSlide
  | MetricGridSlide
  | CodeSlide
  | ClosingSlide
  | NarrativeOpenerSlide
  | HeroStatementSlide
  | ProductShowcaseSlide
  | MarketMapSlide
  | SystemArchitectureSlide
  | DataStorySlide
  | TensionResolutionSlide
  | QuoteBreakSlide
  | FinalAskSlide;

export type ValidationIssue = {
  level: "error" | "warning";
  path: string;
  message: string;
};

export type ValidationResult = {
  ok: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
};
