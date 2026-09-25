# /brag plan: Illuminati Consulting, the new site

## Inspect
- **What it is:** the new landing page for Illuminati Consulting, an AI-first advisory. One scroll takes you from a messy business problem to the best-fit AI, and the number it moved.
- **Who it's for:** enterprise leaders (CXOs, heads of data and transformation). It shows them the firm finds the right AI for each problem, builds it with their teams, and proves it in the P&L.
- **What sets it apart:** real results on the page (+4% topline, +3% margin, 40% efficiency, 20% productivity), and "best-fit, not flashiest" as the promise.
- **Most impressive claim:** +4% topline growth from AI-led sales planning; 40% efficiency gain from multi-agent hubs.
- **Visual hook:** a desk lamp flickering on in a dark strategy room and lighting up the headline. "Illumination" is the brand.
- **Real UI to show:** the scroll story itself (the frame grows and crops, the camera moves through the room, the chapters), then the results list.
- **Tone:** `polished` with cinematic touches: long holds, soft fades, one warm musical bed.
- **Share caption:** "The new illuminaticonsulting.ai: one scroll from business problem to best-fit AI, and the number it moved."

## Angle
The site *is* the pitch. We don't describe the firm; we let the lamp switch on and walk the viewer through the real page, chapter by chapter, ending on the numbers.

## Visual identity (from app/globals.css)
- Background `#030f0c`, gold `#c49528` / lit gold `#eec84a`, cream text `#f3ecd9`, muted `#9fb2a8`
- Newsreader (display, italic gold emphasis), Inter (UI), the real logo `public/img/logowhite.png`
- Real page captured in a 1920×1080 browser; only the hook darkness, one dip and the outro card are added on top

## Storyboard (21.0s, 30fps, 1920×1080)
| # | Time | Scene | On screen | Sound |
|---|---|---|---|---|
| 1 | 0.0 to 3.4 | **Hook: lights on** | Black. At 0.4s the desk lamp flickers on and the whole page flickers up with it, revealing the hero: "The *best-fit* AI for every business problem." Holds lit from 1.1s. | Switch click, filament crackles on each flicker, warm pad swells in (D major) |
| 2 | 3.4 to 6.2 | **Reveal: Insights** | The frame opens, crops to the right and the camera pushes into the pinboard. Gold strings draw from 8 problems to "Best-fit AI solution". Chapter: "Every problem, *illuminated.*" | Soft whoosh, plucked arpeggio starts |
| 3 | 6.2 to 9.7 | **Highlight: Fit** | Camera to the desk; gold solution pieces snap into the problem pieces. "The best-fit answer, *not the flashiest.*" | Whoosh, two soft snaps in key |
| 4 | 9.7 to 12.6 | **Highlight: Action** | Laptop: agent nodes light up one by one. "Built with your team. *Run in production.*" | Six rising blips in the chord |
| 5 | 12.6 to 15.2 | **Highlight: Value** | The city outside lights up window by window; +4% +3% 40% 20% count up. "Measured where *it matters.*" | Shimmer rise, chime when numbers land |
| 6 | 15.2 to 18.0 | **Proof** | Dip through the dark to the real Results section: "Eight problems we solve *again and again.*" with rows of problem → solution → result. | Low swell |
| 7 | 18.0 to 21.0 | **Outro** | Logo glows on over the dark grid, "Illuminati Consulting", "The best-fit AI for every business problem.", `illuminaticonsulting.ai` and a gold "Book a strategy call" pill. Holds. | Resolve to D major, bell on the logo, tail |

Scene durations: 3.4 + 2.8 + 3.5 + 2.9 + 2.6 + 2.8 + 3.0 = 21.0s.

## Build
- Real site (`npm run build && next start`) loaded in headless Edge with reduced motion, so the story snaps to the scroll position and every frame is a pure function of time.
- Per frame: set scroll position from a time map, set the lamp flicker, count-up and overlays, wait two animation frames, screenshot.
- Audio synthesised in numpy (pad, plucks, sub, click/crackle, whooshes, snaps, blips, chime, bell) and mixed into one reverb space, D major throughout.
- ffmpeg: frames + audio → `brag.mp4`; best settled frame → `brag.jpg`, baked in as frame 0.
