# Illuminati Consulting: landing page rebrand

A static, single-page landing site for [illuminaticonsulting.ai](https://www.illuminaticonsulting.ai/). It uses plain HTML, CSS and JS, with no build step.

```
index.html      page markup and copy
styles.css      design tokens + layout
main.js         nav, scroll reveals, hero light, contact form
assets/mark.svg logo mark / favicon
```

Run locally: open `index.html`, or `python3 -m http.server` and visit http://localhost:8000.

## Before going live
- **Contact form**: set `CONTACT_EMAIL` in `main.js`, or wire the form to a form backend (Formspree, HubSpot, etc.).
- **Founder portrait**: replace the "MS" monogram in `.founder__portrait` with a real photo.
- **Careers link**: currently points to the LinkedIn company page.
