# Authoring Guide

Start with the story before writing slides.

## Required Deck Fields

- `version`
- `title`
- `audience`
- `goal`
- `theme`
- `aspectRatio`
- `slides`

Recommended fields:

- `tone`
- `language`
- `alternates`
- `story.thesis`
- `story.arc`
- `visualSystem`

## Visual System

Use `visualSystem` to describe the deck-level effect before writing individual slides.

```json
{
  "visualSystem": {
    "mood": "brand-showcase",
    "density": "editorial",
    "imageTreatment": "product-plinth",
    "compositionRhythm": "hero / proof / system / campaign",
    "colorIntent": "cool appliance showroom with blue and teal accents",
    "typographyIntent": "large keynote titles, restrained body copy",
    "qaPriorities": ["distinct page rhythm", "strong product imagery"]
  }
}
```

Use `layoutVariant` on a slide when the default composition would make adjacent pages feel too similar.

```json
{
  "id": "product-language",
  "type": "product-showcase",
  "layoutVariant": "product-plinth",
  "visualIntent": "Product image acts as the anchor; proof cards explain the design language."
}
```

Recommended variants:

- `narrative-opener`: `split-product`, `full-bleed-image`, `editorial-cover`
- `hero-statement`: `split-proof`, `kinetic-claim`, `proof-wall`
- `product-showcase`: `product-plinth`, `annotated-product`, `specimen-board`
- `media-feature`: `image-led`, `feature-wall`, `captioned-proof`
- `data-story`: `metric-wall`, `single-big-number`, `left-claim-right-proof`
- `market-map`: `segment-cards`, `quadrant`, `journey-segments`
- `system-architecture`: `blueprint-layers`, `platform-map`, `layered-stack`
- `tension-resolution`: `decision-bridge`, `diagonal-split`, `before-after-cards`
- `quote-break`: `full-bleed-quote`, `editorial-quote`, `citation-band`
- `final-ask`: `campaign-brief`, `decision-slide`, `next-actions`

## Media Assets

Use `media` when the slide needs a real product, brand, or scene visual. Do not leave a generic mockup in place when a brand/product page needs inspection.

```json
{
  "media": {
    "src": "../assets/product.jpg",
    "alt": "Official product image",
    "caption": "Official product visual",
    "fit": "cover",
    "position": "70% center"
  }
}
```

Prefer `media-feature` for brand/product analysis pages that need one dominant image and a small number of design takeaways.

## Practical Defaults

- Business deck: `consulting-clean`
- Technical talk: `tech-dark`
- Social carousel: `xiaohongshu-editorial`
- Wedding ceremony or personal event plan: `wedding-editorial`
- Product launch or premium showcase: `premium-keynote`
- AI infrastructure or architecture keynote: `technical-blueprint`
- Founder pitch or investor story: `founder-editorial`
- KPI-heavy operating review: `executive-dashboard`
- Minimal executive brief: `minimal`
- Editorial thought-leadership deck: `editorial`
- Luxury or high-end launch: `luxury`
- Formal enterprise deck: `corporate`
- Dark product metrics dashboard: `dashboard`
- Modular product story: `bento`
- Modern glassy technology deck: `glassmorphism`
- High-impact campaign deck: `neobrutalism`
- Futuristic AI launch: `futuristic`
- Research or education deck: `paper`

Brief routing for `--profile brand-product` also checks subject matter:

- Fridge, appliance, kitchen, freshness: `appliance-showroom`
- Luxury, jewelry, fragrance, beauty: `luxury`
- AI, agent, developer, software: `futuristic` or `technical-blueprint`
- Xiaohongshu, social, lifestyle campaign: `xiaohongshu-editorial`
- Quarterly review, KPI, operating metrics: `executive-dashboard`

## Language Switching

Use top-level `alternates` to connect rendered decks in different languages:

```json
{
  "language": "zh-CN",
  "alternates": [
    {
      "label": "English",
      "language": "en",
      "href": "../../product-launch/output/index.html"
    }
  ]
}
```

The renderer adds a language switcher when `alternates` is present.

## Content Rules

- Prefer one main idea per slide.
- Keep titles under 110 characters.
- Use 3 to 5 points for insight-heavy slides.
- Use `presenterNotes` for spoken context, not visible slide copy.
- Repair overlong content in `deck.json` before touching layout code.
- Verify local images load correctly before exporting.
- Run `npm run verify -- path/to/index.html --visual` for page rhythm warnings.
- Run `npm run contact-sheet -- path/to/index.html` before final delivery.
