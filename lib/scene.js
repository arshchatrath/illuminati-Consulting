// The Strategy Room: a 2.5D scene drawn as stacked SVG layers.
// Every layer shares one 1600x1000 coordinate space; story.js moves a
// virtual camera across them, scaling each layer by its depth for parallax.
// Elements marked "fx" receive the story's CSS variables (--lamp, --p0..--p3);
// keeping them on a few small groups avoids restyling the whole scene each frame.

const NS = 'http://www.w3.org/2000/svg';
export const SCENE_W = 1600;
export const SCENE_H = 1000;

// Deterministic randomness so the scene looks the same on every visit.
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

const INK = '#2c5646';
const INK_SOFT = '#1b3a2e';

export const PROBLEMS = [
  ['Fragmented', 'sales'],
  ['Stockouts', ''],
  ['Pricing', 'guesswork'],
  ['Manual', 'operations'],
  ['Siloed', 'insights'],
  ['Lead funnel', 'leakage'],
  ['Subjective', 'reviews'],
  ['Rigid', 'training'],
];

function layer(depth, name, body, defs = '') {
  return `<svg class="layer layer--${name}" data-depth="${depth}" xmlns="${NS}"
    viewBox="0 0 ${SCENE_W} ${SCENE_H}" width="${SCENE_W}" height="${SCENE_H}" preserveAspectRatio="xMidYMid slice" overflow="visible" aria-hidden="true">
    ${defs ? `<defs>${defs}</defs>` : ''}${body}</svg>`;
}

function sky() {
  const r = rng(7);
  let city = '';
  // Windows are grouped into 20 paths by the moment they light up in chapter 4,
  // so the city is 20 elements instead of ~700.
  const steps = Array(20).fill('');
  let x = -500;
  while (x < 1300) {
    const w = 60 + Math.floor(r() * 90);
    const h = 170 + Math.floor(r() * 300);
    const top = 660 - h;
    city += `<rect x="${x}" y="${top}" width="${w}" height="${h + 400}" fill="#0a1d16" stroke="${INK_SOFT}" stroke-width="1.5"/>`;
    if (r() > 0.6) city += `<rect x="${x + w / 2 - 2}" y="${top - 30}" width="4" height="30" fill="#0a1d16"/>`;
    for (let wy = top + 16; wy < 640; wy += 20) {
      for (let wx = x + 9; wx < x + w - 12; wx += 15) {
        steps[Math.floor(r() * 20)] += `M${wx} ${wy}h6v9h-6z`;
      }
    }
    x += w + 6 + Math.floor(r() * 14);
  }
  const defs = `
    <linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#030c09"/><stop offset=".55" stop-color="#0b241b"/><stop offset="1" stop-color="#143a2c"/>
    </linearGradient>
    <radialGradient id="g-moon"><stop offset="0" stop-color="#f6e3a8" stop-opacity=".55"/><stop offset="1" stop-color="#f6e3a8" stop-opacity="0"/></radialGradient>
    <radialGradient id="g-dawn" cx=".5" cy="1" r=".8"><stop offset="0" stop-color="#e3b04b" stop-opacity=".45"/><stop offset="1" stop-color="#e3b04b" stop-opacity="0"/></radialGradient>`;
  return layer(0.55, 'sky', `
    <rect x="-900" y="-600" width="3400" height="2200" fill="url(#g-sky)"/>
    <circle cx="410" cy="180" r="140" fill="url(#g-moon)"/>
    <circle cx="410" cy="180" r="34" fill="#f1dca0"/>
    <circle cx="398" cy="172" r="34" fill="#0b241b" opacity=".18"/>
    <rect class="dawn fx" x="-600" y="250" width="2000" height="500" fill="url(#g-dawn)" opacity="0"/>
    <g class="city">${city}${steps.map((d, i) =>
      `<path class="win" data-t="${i / 20}" d="${d}" fill="${i / 20 < 0.08 ? '#e3b04b' : '#11291f'}"/>`).join('')}</g>`, defs);
}

function wall() {
  const r = rng(11);
  // Wall with the window cut out (even-odd fill).
  const wallPath = `M-900 -600 H2500 V1600 H-900 Z M70 70 V600 H560 V70 Z`;

  let notes = '';
  let strings = '';
  const hub = { x: 935, y: 269 };
  const slots = [[712, 128], [830, 124], [948, 128], [1066, 124], [712, 352], [830, 356], [948, 350], [1066, 354]];
  PROBLEMS.forEach(([a, b], i) => {
    const [nx, ny] = slots[i];
    const rot = ((r() - 0.5) * 8).toFixed(1);
    const cx = nx + 50;
    const cy = i < 4 ? ny + 76 : ny;
    const midX = (cx + hub.x) / 2 + (r() - 0.5) * 30;
    const midY = (cy + hub.y) / 2 + 18;
    strings += `<path class="string" d="M${cx} ${cy} Q${midX.toFixed(0)} ${midY.toFixed(0)} ${hub.x} ${hub.y}" pathLength="1"/>`;
    notes += `<g class="note" style="--i:${i}" transform="rotate(${rot} ${cx} ${ny + 38})">
      <rect x="${nx}" y="${ny}" width="100" height="76" rx="2" fill="#e9dcb8" stroke="#b9a877" stroke-width="1"/>
      <rect x="${nx}" y="${ny}" width="100" height="10" fill="#d8c894" opacity=".6"/>
      <text x="${nx + 10}" y="${ny + 37}" class="hand" fill="#1b2a22">${a}</text>
      <text x="${nx + 10}" y="${ny + 60}" class="hand" fill="#1b2a22">${b}</text>
      <path class="tick" d="M${nx + 76} ${ny + 58} l6 7 l12 -16" pathLength="1"/>
      <circle cx="${cx}" cy="${ny + 5}" r="5" fill="#c49528" stroke="#7a5e10"/>
    </g>`;
  });

  let cork = '';
  for (let i = 0; i < 260; i++) {
    const cx = (696 + r() * 478).toFixed(0);
    const cy = (116 + r() * 328).toFixed(0);
    const cr = +(0.8 + r() * 1.4).toFixed(1);
    cork += `M${cx - cr} ${cy}a${cr} ${cr} 0 1 0 ${2 * cr} 0a${cr} ${cr} 0 1 0 ${-2 * cr} 0`;
  }

  // Bookshelf on the right.
  let books = '';
  const shelves = [330, 520];
  for (const sy of shelves) {
    let bx = 1290;
    while (bx < 1540) {
      const bw = 14 + Math.floor(r() * 16);
      const bh = 90 + Math.floor(r() * 60);
      const tone = ['#123027', '#0f261e', '#1a3a2f', '#3b3217', '#16362b'][Math.floor(r() * 5)];
      const lean = r() > 0.88 ? 8 : 0;
      books += `<rect x="${bx}" y="${sy - bh}" width="${bw}" height="${bh}" fill="${tone}" stroke="${INK}" stroke-width="1.2"
        ${lean ? `transform="rotate(${lean} ${bx} ${sy})"` : ''}/>`;
      if (r() > 0.6) books += `<rect x="${bx + 3}" y="${sy - bh + 14}" width="${bw - 6}" height="3" fill="#c49528" opacity=".55"/>`;
      bx += bw + 2 + (lean ? 8 : 0);
    }
  }

  const defs = `
    <radialGradient id="g-spill" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#f0c96a" stop-opacity=".22"/><stop offset=".6" stop-color="#f0c96a" stop-opacity=".06"/><stop offset="1" stop-color="#f0c96a" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="g-wall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#07170f"/><stop offset="1" stop-color="#0d2a20"/>
    </linearGradient>`;

  return layer(0.75, 'wall', `
    <path d="${wallPath}" fill="url(#g-wall)" fill-rule="evenodd"/>
    <ellipse class="spill fx" cx="1250" cy="560" rx="620" ry="380" fill="url(#g-spill)"/>
    <!-- window frame -->
    <g fill="#061410" stroke="${INK}" stroke-width="1.5">
      <path d="M58 58 H572 V612 H58 Z M70 70 V600 H560 V70 Z" fill-rule="evenodd"/>
      <rect x="309" y="70" width="12" height="530"/>
      <rect x="70" y="328" width="490" height="10"/>
      <rect x="40" y="600" width="550" height="20"/>
    </g>
    <!-- investigation board -->
    <rect x="684" y="104" width="502" height="352" rx="6" fill="#241f14" stroke="#3b3322" stroke-width="6"/>
    <path d="${cork}" fill="#3a3121"/>
    <g class="strings fx">${strings}</g>
    <g class="notes fx">${notes}</g>
    <g class="hub fx">
      <rect x="870" y="240" width="130" height="58" rx="3" fill="#c49528" stroke="#f0cf6b" stroke-width="1.5"/>
      <text x="935" y="264" text-anchor="middle" class="mono" fill="#1a1406">BEST-FIT</text>
      <text x="935" y="284" text-anchor="middle" class="mono" fill="#1a1406">AI SOLUTION</text>
    </g>
    <!-- shelf -->
    <g stroke="${INK}" stroke-width="1.5">
      <rect x="1270" y="330" width="300" height="12" fill="#0a1d16"/>
      <rect x="1270" y="520" width="300" height="12" fill="#0a1d16"/>
    </g>
    <g>${books}</g>
    <g stroke="${INK}" stroke-width="1.5">
      <path d="M1470 330 l10 -60 h44 l10 60 Z" fill="#12281f"/>
      <path d="M1502 272 c-30 -40 -20 -80 -6 -96 c4 30 14 50 6 96 Z M1502 272 c20 -30 40 -40 58 -40 c-12 20 -30 36 -58 40 Z M1502 272 c-26 -20 -46 -24 -64 -20 c16 16 36 22 64 20 Z" fill="#0f2d22"/>
      <rect x="1296" y="440" width="70" height="80" fill="#0b1f18"/>
      <rect x="1306" y="450" width="50" height="60" fill="#c49528" opacity=".18"/>
    </g>`, defs);
}

function desk() {
  // Puzzle pieces: a 120x80 "problem" piece with a knob, and a matching "solution" socket piece.
  const knob = 'M0 0 H120 V26 C132 18 146 30 146 40 C146 50 132 62 120 54 V80 H0 Z';
  const socket = 'M0 0 H120 V80 H0 V54 C12 62 26 50 26 40 C26 30 12 18 0 26 Z';
  const pair = (x, y, rot, problem, solution, i) => `
    <g transform="translate(${x} ${y}) rotate(${rot})">
      <path d="${knob}" fill="#16342a" stroke="${INK}" stroke-width="1.5"/>
      <text x="14" y="36" class="hand hand--sm" fill="#c9d6cf">${problem[0]}</text>
      <text x="14" y="58" class="hand hand--sm" fill="#c9d6cf">${problem[1]}</text>
      <g class="piece" data-i="${i}">
        <path d="${socket}" transform="translate(120 0)" fill="#c49528" stroke="#f0cf6b" stroke-width="1.5"/>
        <text x="148" y="36" class="hand hand--sm" fill="#1a1406">${solution[0]}</text>
        <text x="148" y="58" class="hand hand--sm" fill="#1a1406">${solution[1]}</text>
      </g>
    </g>`;

  // Agent graph on the laptop screen.
  const nodes = [[1000, 572], [1062, 620], [1004, 664], [1128, 566], [1180, 628], [1118, 668]];
  const links = [[0, 1], [2, 1], [1, 3], [1, 5], [3, 4], [5, 4]];
  const linkSvg = links.map(([a, b], i) =>
    `<line class="link" style="--i:${i}" x1="${nodes[a][0]}" y1="${nodes[a][1]}" x2="${nodes[b][0]}" y2="${nodes[b][1]}" pathLength="1"/>`).join('');
  const nodeSvg = nodes.map(([x, y], i) =>
    `<g class="node" style="--i:${i}"><circle cx="${x}" cy="${y}" r="11"/><circle cx="${x}" cy="${y}" r="4" class="node__core"/></g>`).join('');

  const defs = `
    <linearGradient id="g-cone" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffe3a0" stop-opacity=".55"/><stop offset="1" stop-color="#f0c96a" stop-opacity=".04"/>
    </linearGradient>
    <radialGradient id="g-pool" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#ffd98a" stop-opacity=".6"/><stop offset=".55" stop-color="#e8b85a" stop-opacity=".2"/><stop offset="1" stop-color="#e8b85a" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g-bulb" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#fff4cf"/><stop offset=".3" stop-color="#ffd87a" stop-opacity=".8"/><stop offset="1" stop-color="#ffd87a" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="g-desk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0c2019"/><stop offset="1" stop-color="#132e24"/>
    </linearGradient>
    <radialGradient id="g-screen" cx=".5" cy=".5" r=".6">
      <stop offset="0" stop-color="#123326"/><stop offset="1" stop-color="#06120d"/>
    </radialGradient>`;

  return layer(1, 'desk', `
    <rect x="-900" y="610" width="3400" height="900" fill="url(#g-desk)"/>
    <line x1="-900" y1="610" x2="2500" y2="610" stroke="#2f5b4a" stroke-width="2"/>
    <!-- papers -->
    <g stroke="#b9a877" stroke-width="1">
      <path d="M640 700 L870 684 L892 780 L656 800 Z" fill="#d9ccaa"/>
      <path d="M660 690 L890 694 L884 790 L650 782 Z" fill="#e9dcb8"/>
      <g stroke="#8f8263" opacity=".7"><path d="M680 716 H850 M680 732 H830 M680 748 H862 M680 764 H800"/></g>
    </g>
    <!-- chart paper (value) -->
    <g transform="rotate(-6 1060 890)">
      <rect x="950" y="820" width="240" height="150" fill="#e9dcb8" stroke="#b9a877"/>
      <g stroke="#c9b98f" stroke-width=".8">
        <path d="M970 840 V950 H1175"/><path d="M970 920 H1175 M970 890 H1175 M970 860 H1175" stroke-dasharray="3 4"/>
      </g>
      <g class="bars" fill="#16342a">
        <rect x="990" y="925" width="18" height="25"/><rect x="1024" y="912" width="18" height="38"/>
        <rect x="1058" y="900" width="18" height="50"/><rect x="1092" y="884" width="18" height="66"/>
        <rect x="1126" y="862" width="18" height="88"/>
      </g>
      <path class="trend fx" d="M980 935 L1015 922 L1050 910 L1085 890 L1120 872 L1165 846" pathLength="1"/>
      <text x="1120" y="838" class="hand hand--sm trend-label fx" fill="#7a5e10">+4% topline</text>
    </g>
    <!-- laptop -->
    <g stroke="${INK}" stroke-width="1.5">
      <rect x="950" y="515" width="285" height="186" rx="8" fill="#0a1a14"/>
      <rect x="962" y="527" width="261" height="162" rx="3" fill="url(#g-screen)" class="screen fx"/>
      <path d="M925 700 H1260 L1292 770 H893 Z" fill="#16362b"/>
      <path d="M930 712 H1255 M920 728 H1265 M912 744 H1272" stroke="#23483a" stroke-width="1"/>
      <rect x="1060" y="752" width="70" height="10" rx="2" fill="#0f261e"/>
    </g>
    <text x="972" y="545" class="mono mono--xs" fill="#5f8f7a">agents.live</text>
    <circle class="live-dot" cx="1212" cy="541" r="3.5" fill="#e3b04b"/>
    <g class="graph fx">${linkSvg}${nodeSvg}</g>
    <!-- puzzle -->
    ${pair(560, 812, -4, ['Stockouts', ''], ['Demand', 'forecast'], 0)}
    ${pair(600, 912, 3, ['Pricing', 'guesswork'], ['Dynamic', 'pricing'], 1)}
    <!-- mug -->
    <g stroke="${INK}" stroke-width="1.5">
      <path d="M1320 740 V800 C1320 812 1380 812 1380 800 V740" fill="#123027"/>
      <ellipse cx="1350" cy="740" rx="30" ry="9" fill="#0a1a14"/>
      <path d="M1380 752 c18 0 18 34 0 34" fill="none" stroke-width="5" stroke="#123027"/>
    </g>
    <g class="steam" fill="none" stroke="#9fb9ad" stroke-width="2" stroke-linecap="round" opacity=".35">
      <path d="M1340 725 c-8 -14 8 -22 0 -38"/><path d="M1358 722 c-8 -14 8 -22 0 -40"/>
    </g>
    <!-- notebook + pen -->
    <g transform="rotate(8 1400 900)" stroke="${INK}" stroke-width="1.5">
      <rect x="1290" y="840" width="190" height="130" rx="4" fill="#0f261e"/>
      <path d="M1300 848 V962" stroke="#c49528" stroke-width="3"/>
      <path d="M1320 940 L1450 850" stroke="#c49528" stroke-width="6" stroke-linecap="round"/>
    </g>
    <!-- lamp -->
    <path class="cone fx" d="M1268 528 L1362 520 L1460 900 L700 990 Z" fill="url(#g-cone)"/>
    <ellipse class="pool fx" cx="1040" cy="850" rx="480" ry="170" fill="url(#g-pool)"/>
    <g stroke="${INK}" stroke-width="1.5" fill="#0a1d16">
      <rect x="1478" y="596" width="56" height="20" rx="3"/>
      <path d="M1505 598 L1530 330" stroke="#1f4035" stroke-width="10" stroke-linecap="round"/>
      <path d="M1530 330 L1392 446" stroke="#1f4035" stroke-width="9" stroke-linecap="round"/>
      <circle cx="1530" cy="330" r="9"/>
      <path d="M1378 440 L1396 474 L1362 520 L1268 526 Z" fill="#12281f"/>
      <path d="M1378 440 L1396 474" stroke="#c49528" stroke-width="3"/>
    </g>
    <ellipse class="bulb fx" cx="1314" cy="522" rx="70" ry="44" fill="url(#g-bulb)"/>`, defs);
}

function foreground() {
  return layer(1.25, 'fg', `
    <!-- chair back -->
    <path d="M150 790 Q150 760 180 760 H500 Q530 760 530 790 V1300 H150 Z" fill="#040d0a" stroke="#1d3a2f" stroke-width="2"/>
    <path d="M190 800 H490" stroke="#1d3a2f" stroke-width="2"/>
    <!-- consultant, seen from behind -->
    <g fill="#030a07" stroke="#16302a" stroke-width="2">
      <path d="M170 1300 C160 980 200 800 280 736 C300 718 318 700 322 668 H372 C376 700 394 718 420 736 C470 770 520 780 590 810 L640 842 C650 850 648 866 636 868 L560 858 C520 900 520 1100 520 1300 Z"/>
      <circle cx="346" cy="604" r="66"/>
      <circle cx="352" cy="522" r="26"/>
    </g>
    <!-- rim light from the lamp -->
    <g class="rim fx" fill="none" stroke="#e8b85a" stroke-width="3" stroke-linecap="round">
      <path d="M392 556 A66 66 0 0 1 408 632"/>
      <path d="M372 506 A26 26 0 0 1 378 530"/>
      <path d="M430 742 C480 770 530 782 588 810"/>
    </g>
    <ellipse cx="632" cy="858" rx="14" ry="9" fill="#d9b779"/>
    <!-- foreground plant -->
    <g fill="#020806" stroke="#12281f" stroke-width="2">
      <path d="M1560 1300 C1540 1100 1500 1000 1420 930 C1500 950 1560 1010 1600 1100 Z"/>
      <path d="M1600 1300 C1600 1080 1620 960 1700 880 C1690 990 1660 1100 1640 1300 Z"/>
      <path d="M1580 1300 C1480 1150 1380 1110 1290 1110 C1390 1080 1500 1130 1610 1250 Z"/>
    </g>`);
}

// Rendered on the server, so the scene shows before (and without) JavaScript.
export const sceneMarkup = () => sky() + wall() + desk() + foreground();

export function bindScene(stage) {
  return {
    layers: [...stage.querySelectorAll('.layer')].map((el) => ({ el, depth: parseFloat(el.dataset.depth) })),
    windows: [...stage.querySelectorAll('.win')].map((el) => ({ el, t: parseFloat(el.dataset.t), on: false })),
    pieces: [...stage.querySelectorAll('.piece')],
    fx: [...stage.querySelectorAll('.fx')],
  };
}
