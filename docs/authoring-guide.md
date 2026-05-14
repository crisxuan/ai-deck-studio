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
- `story.thesis`
- `story.arc`

## Practical Defaults

- Business deck: `consulting-clean`
- Technical talk: `tech-dark`
- Social carousel: `xiaohongshu-editorial`
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
