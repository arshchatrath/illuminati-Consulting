import { buildScene } from './scene.js';

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const band = (t, a, b) => clamp((t - a) / (b - a));

/* ---------------------------------------------------------------
   Story timeline
   The frame moves between three shapes: "hero" (a wide strip under
   the headline), "full" (fills the viewport) and "split" (compressed
   to the right, chapter text on the left). The camera [x, y, zoom]
   is in scene coordinates.
---------------------------------------------------------------- */
const CAM = {
  hero: [800, 600, 1.0],
  wide: [810, 560, 1.18],
  board: [935, 285, 2.05],
  puzzle: [770, 875, 2.1],
  laptop: [1092, 628, 2.3],
  city: [330, 360, 1.75],
};

const KEYS = [
  { t: 0.0, f: 'hero', c: CAM.hero },
  { t: 0.08, f: 'full', c: CAM.wide },
  { t: 0.14, f: 'split', c: CAM.board },
  { t: 0.26, f: 'split', c: CAM.board },
  { t: 0.32, f: 'full', c: CAM.wide },
  { t: 0.38, f: 'split', c: CAM.puzzle },
  { t: 0.5, f: 'split', c: CAM.puzzle },
  { t: 0.56, f: 'full', c: CAM.wide },
  { t: 0.62, f: 'split', c: CAM.laptop },
  { t: 0.74, f: 'split', c: CAM.laptop },
  { t: 0.8, f: 'full', c: CAM.wide },
  { t: 0.86, f: 'split', c: CAM.city },
  { t: 1.0, f: 'split', c: CAM.city },
];

// [enter, leave] for each chapter's text.
const CHAPTERS = [[0.14, 0.26], [0.38, 0.5], [0.62, 0.74], [0.86, 1.01]];

const story = document.getElementById('story');
const frame = document.getElementById('frame');
const stage = document.getElementById('stage');
const hero = document.getElementById('hero');
const caption = document.getElementById('caption');
const chapters = [...document.querySelectorAll('.chapter')];
const progressItems = [...document.querySelectorAll('#progress li')];
const progress = document.getElementById('progress');

const scene = buildScene(stage);

let vw = 0;
let vh = 0;
let mobile = false;
let shapes = {};

function measure() {
  vw = window.innerWidth;
  vh = window.innerHeight;
  mobile = vw < 820;
  const m = mobile ? 12 : 24;
  const navH = mobile ? 68 : 80;
  const heroBottom = hero.offsetTop + hero.offsetHeight;
  const heroTop = Math.min(Math.max(heroBottom + (mobile ? 18 : 12), vh * 0.36), vh * 0.62);
  // Each shape is [top, right, bottom, left] insets in px.
  shapes = {
    hero: [heroTop, m, m, m],
    full: [navH, m, m, m],
    split: mobile ? [navH, m, vh * 0.47, m] : [navH, m, m, Math.round(vw * 0.4)],
  };
}

function sampleKeys(t) {
  let i = 0;
  while (i < KEYS.length - 2 && t > KEYS[i + 1].t) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const k = ease(clamp((t - a.t) / (b.t - a.t)));
  const sa = shapes[a.f];
  const sb = shapes[b.f];
  return {
    inset: sa.map((v, j) => lerp(v, sb[j], k)),
    cam: a.c.map((v, j) => lerp(v, b.c[j], k)),
  };
}

let lampIntro = reduceMotion ? 1 : 0;
let target = 0;
let current = 0;

function readScroll() {
  const range = story.offsetHeight - vh;
  target = clamp((window.scrollY - story.offsetTop) / range);
}

function render(t) {
  const { inset, cam } = sampleKeys(t);
  const [top, right, bottom, left] = inset;
  const w = vw - left - right;
  const h = vh - top - bottom;

  frame.style.top = `${top}px`;
  frame.style.left = `${left}px`;
  frame.style.width = `${w}px`;
  frame.style.height = `${h}px`;
  stage.style.transform = `translate3d(${-left}px, ${-top}px, 0)`;

  // Camera: every layer keeps the focus point at the centre of the frame,
  // and zooms by its own depth, so near layers move faster than far ones.
  const base = Math.max(vw / 1600, vh / 1000) * 1.02;
  const fx = left + w / 2;
  const fy = top + h / 2;
  const [cx, cy, zRaw] = cam;
  // Phones already crop the scene hard, so zoom in less.
  const z = mobile ? 1 + (zRaw - 1) * 0.55 : zRaw;
  for (const { el, depth } of scene.layers) {
    const s = base * (1 + (z - 1) * depth);
    el.style.transform = `translate3d(${(fx - cx * s).toFixed(1)}px, ${(fy - cy * s).toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
  }

  // Hero copy leaves as the frame opens.
  const heroOut = ease(band(t, 0, 0.07));
  hero.style.opacity = (1 - heroOut).toFixed(3);
  hero.style.transform = `translateY(${(-60 * heroOut).toFixed(1)}px)`;
  hero.style.visibility = heroOut >= 1 ? 'hidden' : 'visible';
  caption.style.opacity = (1 - band(t, 0, 0.04)).toFixed(3);

  // Chapter text and per-chapter scene effects.
  let active = -1;
  CHAPTERS.forEach(([a, b], i) => {
    const vis = band(t, a - 0.03, a) * (1 - band(t, b, b + 0.03));
    const el = chapters[i];
    el.style.opacity = vis.toFixed(3);
    el.style.transform = `translateY(${((1 - vis) * 24).toFixed(1)}px)`;
    el.style.visibility = vis > 0.01 ? 'visible' : 'hidden';
    el.classList.toggle('is-active', vis > 0.6);
    if (vis > 0.5) active = i;
    const p = band(t, a - 0.04, b - 0.03);
    stage.style.setProperty(`--p${i}`, p.toFixed(3));
    if (i === 3 && vis > 0.6) countUp(el);
  });

  progressItems.forEach((li, i) => li.classList.toggle('is-active', i === active));
  progress.style.opacity = active >= 0 ? 1 : 0;

  // Chapter 2: solution pieces slide in and snap onto the problem pieces.
  const p1 = band(t, 0.35, 0.47);
  scene.pieces.forEach((piece, i) => {
    const e = ease(clamp(p1 * 1.7 - i * 0.55));
    piece.setAttribute('transform', `translate(${((1 - e) * 90).toFixed(1)} ${((1 - e) * -46).toFixed(1)}) rotate(${((1 - e) * 16).toFixed(1)} 180 40)`);
    piece.classList.toggle('is-snapped', e > 0.98);
  });

  // Chapter 4: the city outside lights up.
  const p3 = band(t, 0.82, 0.97);
  const threshold = 0.08 + p3 * 0.62;
  for (const win of scene.windows) {
    const on = win.t < threshold;
    if (on !== win.on) {
      win.on = on;
      win.el.setAttribute('fill', on ? '#e3b04b' : '#11291f');
    }
  }

  stage.style.setProperty('--lamp', lampIntro.toFixed(3));
}

function tick() {
  readScroll();
  const k = reduceMotion ? 1 : 0.1;
  current += (target - current) * k;
  if (Math.abs(target - current) < 0.0002) current = target;
  render(current);
  requestAnimationFrame(tick);
}

// The lamp switches on shortly after load, with a small flicker.
function lampOn() {
  if (reduceMotion) return;
  const start = performance.now() + 450;
  const flicker = [[0, 0], [90, 0.7], [150, 0.15], [260, 0.85], [320, 0.4], [520, 1]];
  const step = (now) => {
    const e = now - start;
    let v = 0;
    for (const [ms, val] of flicker) if (e >= ms) v = val;
    lampIntro = v;
    if (e < 540) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---------------------------------------------------------------
   Count-up numbers
---------------------------------------------------------------- */
function countUp(root) {
  if (root.dataset.counted) return;
  root.dataset.counted = '1';
  root.querySelectorAll('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    const pre = el.dataset.prefix || '';
    const suf = el.dataset.suffix || '';
    if (reduceMotion) return;
    const t0 = performance.now();
    const step = (now) => {
      const k = clamp((now - t0) / 1100);
      el.textContent = `${pre}${Math.round(end * ease(k))}${suf}`;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

/* ---------------------------------------------------------------
   Below-the-story sections
---------------------------------------------------------------- */
function setupReveals() {
  const els = document.querySelectorAll('.pairs li, .stats, .case, .person, .section__head');
  els.forEach((el) => el.classList.add('reveal'));
  if (reduceMotion || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-in');
      if (entry.target.classList.contains('stats')) countUp(entry.target);
      io.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -12% 0px' });
  els.forEach((el) => io.observe(el));
}

function setupCases() {
  const track = document.getElementById('cases');
  document.querySelectorAll('.work__nav .round').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = track.querySelector('.case');
      const step = card ? card.offsetWidth + 20 : 320;
      track.scrollBy({ left: step * Number(btn.dataset.dir), behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });
}

const MODELS = [
  'AI choices, a review and audit of your current AI and tech landscape, priorities and a roadmap.',
  'Awareness and team readiness for AI across every persona, from the C-suite to the field.',
  'Joint execution with your teams. We embed alongside your people to build and ship together.',
  'Prototype AI solutions at speed on real data samples, ready for fast iteration.',
  'We prototype the solution and programme-manage the implementation delivered by your partners.',
  'End-to-end implementation and scale, from strategy through production, fully owned by us.',
];

function setupDimmer() {
  const root = document.getElementById('dimmer');
  const stops = [...root.querySelectorAll('[role=tab]')];
  const desc = document.getElementById('dimmer-desc');
  const select = (i) => {
    stops.forEach((s, j) => {
      s.setAttribute('aria-selected', String(i === j));
      s.classList.toggle('is-lit', j <= i);
      s.tabIndex = i === j ? 0 : -1;
    });
    root.style.setProperty('--level', (i / (stops.length - 1)).toFixed(3));
    desc.textContent = MODELS[i];
  };
  stops.forEach((s, i) => {
    s.addEventListener('click', () => select(i));
    s.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      const n = clamp(i + d, 0, stops.length - 1);
      stops[n].focus();
      select(n);
    });
  });
  select(2);
}

function setupForm() {
  const form = document.getElementById('contact-form');
  const status = form.querySelector('.form__status');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      status.textContent = 'Please add your name, a valid work email and a short note.';
      form.reportValidity();
      return;
    }
    const d = new FormData(form);
    const to = 'moumita.sarker@illuminaticonsulting.ai,kaushik.agate@illuminaticonsulting.ai';
    const subject = `Enquiry from ${d.get('name')}${d.get('company') ? ` (${d.get('company')})` : ''}`;
    const body = `${d.get('message')}\n\n${d.get('name')}\n${d.get('email')}\n${d.get('company') || ''}`;
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Opening your email app…';
  });
}

document.getElementById('year').textContent = new Date().getFullYear();
measure();
window.addEventListener('resize', measure);
document.fonts?.ready.then(measure);
setupReveals();
setupCases();
setupDimmer();
setupForm();
lampOn();
requestAnimationFrame(tick);
