# Aurevon Partners website

Public corporate website for **Aurevon Partners S.à r.l.-SPF**, designed as a lightweight, dependency-free static site.

The site is available in English, French and Turkish. English pages live at the project root; full French and Turkish versions live under `fr/` and `tr/`. Every page includes direct language equivalents and `hreflang` metadata.

## Pages

- `index.html` — company overview, investment markets and contact
- `about.html` — detailed company profile and sector investment focus
- `foundation.html` — annual philanthropic division and programme with status disclosure
- `legal.html` — company and SPF legal notice
- `privacy.html` — privacy information
- `fr/` — complete French version of all five pages
- `tr/` — complete Turkish version of all five pages

## Local preview

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Validation

```bash
npm test
```

## Deployment

GitHub Pages serves the repository from the `main` branch. The production domain remains separate until its DNS and hosting configuration are deliberately migrated.

## Legal content note

“Aurevon Foundation” is presented as the philanthropic division and annual programme of Aurevon Partners, not as a separately incorporated or registered foundation or public grant-making institution. Its public status language should only be changed if a separate legal vehicle is established and counsel has approved the wording.
