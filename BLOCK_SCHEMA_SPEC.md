# Block Schema Spec v1 (Naomi)

## Block Types (7)
1. `hero` — title/headline: fields: eyebrow, headline, subheadline, meta[]
2. `stat-grid` — 1~4 stats: fields: items[{ value, label, tone }]
3. `progress-list` — 2~8 items: fields: items[{ title, desc, status }] (done|in_progress|blocked)
4. `highlight` — single point: fields: label, title, body
5. `bullet-section` — list: fields: title, items[]
6. `quote` — punchline: fields: text, attribution?
7. `footer` — fields: weekOf, author?, note?

## Slide Schema
```json
{
  "slideType": "summary",
  "blocks": [
    { "type": "hero", "headline": "...", "subheadline": "..." },
    { "type": "stat-grid", "items": [...] },
    { "type": "footer", "weekOf": "2026-03-09" }
  ]
}
```

## Output Contract
```json
{
  "styleCategory": "structural",
  "templateVariant": "dashboard-a",
  "deckTone": "executive",
  "slides": [...]
}
```

## Input → Slide Mapping
- Summary → 1 `summary` slide (hero + optional stat-grid + footer)
- Progress → 1 `progress` slide (hero + progress-list + optional stat-grid)
- Newsletter (if filled) → 1 `newsletter` slide (bullet-section + optional highlight)
- Others (if filled) → 1 `others` slide (bullet-section)
- Top of Mind (if filled) → 1 `top-of-mind` slide (quote or highlight or bullet-section)

## Content-Driven Rules (Renderer)
- progress items <= 3 → large cards
- 4~6 → compact grid/list
- >6 → 2 columns or 2 slides
- summary < 90 chars → big headline
- 90~220 chars → headline + subheadline
- > 220 chars → headline + bullets
- optional field empty → no slide
- stats missing → block not rendered

## Template Constraints (MVP)
- `dashboard-a`: summary(hero+stat-grid+footer), progress(hero+progress-list+stat-grid)
- `editorial-a`: summary(hero+quote+footer), newsletter(highlight+bullet-section)
- `split-a`: summary(hero+highlight), progress(progress-list+stat-grid)

## AI does: parse input, derive stats, pick variant, fill block JSON
## AI does NOT: write CSS, write HTML, invent block types
## Renderer does: JSON→HTML using template partials, item-count adaptation, overflow splitting
