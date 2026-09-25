# Illuminati Consulting: landing page rebrand

A static landing page for [illuminaticonsulting.ai](https://www.illuminaticonsulting.ai/), built with plain HTML, CSS and JS. There is no build step.

**Concept: "The Strategy Room."** A consultant's desk at night under one gold lamp. As you scroll, the scene's frame grows, then compresses to the right, and the camera moves through four chapters that follow the brand line *Insights → Fit → Action → Value*:

| # | Chapter | What happens in the scene |
|---|---|---|
| 1 | Insights: "Every problem, illuminated." | Gold strings connect the 8 business-problem notes on the board to a "best-fit AI solution" card |
| 2 | Fit: "The best-fit answer, not the flashiest." | Gold solution pieces snap into the problem puzzle pieces on the desk |
| 3 | Action: "Built with your team. Run in production." | Agent nodes light up on the laptop |
| 4 | Value: "Measured where it matters." | The city outside lights up, next to the real results (+4%, +3%, 40%, 20%) |

The design is inspired by [illoca.unseen.co](https://illoca.unseen.co/). The scene is 2.5D: four SVG depth layers (sky, wall, desk, foreground) moved by a virtual camera, with parallax.

```
index.html          page markup and copy
css/styles.css      brand tokens, layout, scene animation styles
js/scene.js         draws the Strategy Room SVG layers
js/main.js          scroll timeline: frame shape, camera, chapters, section interactions
assets/img/         logo and leadership photos (from the current site)
docs/current-site/  verbatim content inventory and screenshots of the current site
```

**Run locally:** `python3 -m http.server`, then open http://localhost:8000. The page uses ES modules, so opening the file directly with `file://` won't work.

**Tuning the story:** the timeline is `KEYS` in `js/main.js`. Each key has a scroll position `t` (0–1), a frame shape (`hero`, `full` or `split`) and a camera `[x, y, zoom]` in scene coordinates (1600×1000). Chapter text timing is set in `CHAPTERS`.

## Before going live
- The contact form opens the visitor's email app, addressed to Moumita and Kaushik. Wire it to a form backend or CRM if you want submissions stored.
- The chapter copy is new, drafted from the current site's content. It needs client approval.
- The favicon and social share image need proper versions (the current site's `og-image.png` returns 404).
