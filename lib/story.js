import { bindScene } from './scene';

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

const MODELS = [
  'AI choices, a review and audit of your current AI and tech landscape, priorities and a roadmap.',
  'Awareness and team readiness for AI across every persona, from the C-suite to the field.',
  'Joint execution with your teams. We embed alongside your people to build and ship together.',
  'Prototype AI solutions at speed on real data samples, ready for fast iteration.',
  'We prototype the solution and programme-manage the implementation delivered by your partners.',
  'End-to-end implementation and scale, from strategy through production, fully owned by us.',
];

// Starts the scroll story and section interactions on the server-rendered page.
// lamp: switch the desk lamp on straight away (false when a preloader will call lampOn()).
// Returns { destroy, lampOn }; destroy cleans up (React mounts effects twice in development).
export function initPage({ lamp = true } = {}) {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ac = new AbortController();
  const { signal } = ac;
  const on = (el, type, fn, opts) => el.addEventListener(type, fn, { ...opts, signal });

  const story = document.getElementById('story');
  const frame = document.getElementById('frame');
  const ring = document.getElementById('ring');
  const stage = document.getElementById('stage');
  const hero = document.getElementById('hero');
  const caption = document.getElementById('caption');
  const chaptersEl = document.getElementById('chapters');
  const chapters = [...chaptersEl.querySelectorAll('.chapter')];
  const progress = document.getElementById('progress');
  const progressItems = [...progress.querySelectorAll('li')];

  const scene = bindScene(stage);
  // Hero: on desktop the desk lamp's light follows the pointer across the desk.
  const cone = stage.querySelector('.cone');
  const pool = stage.querySelector('.pool');
  let aimTarget = 0;
  let aim = 0;
  stage.classList.add('is-live');
  frame.classList.add('is-live');

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
    // Matches the CSS starting layout (frame directly under the hero), so there is no jump on load.
    const heroTop = hero.offsetTop + hero.offsetHeight + (mobile ? 18 : 12);
    // On phones and tablets the chapter text sits under the frame. Size that strip
    // to the tallest chapter so the frame gets the rest (no empty band below the text).
    let textBand = 0;
    if (mobile) {
      const tallest = Math.max(...chapters.map((c) =>
        c.lastElementChild.getBoundingClientRect().bottom - c.firstElementChild.getBoundingClientRect().top));
      textBand = clamp(tallest + 44, vh * 0.3, vh * 0.55);
      chaptersEl.style.height = `${textBand - 28}px`;
    } else {
      chaptersEl.style.height = '';
    }
    // Each shape is [top, right, bottom, left] insets in px.
    shapes = {
      hero: [heroTop, m, m, m],
      full: [navH, m, m, m],
      split: mobile ? [navH, m, textBand, m] : [navH, m, m, Math.round(vw * 0.4)],
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
  let lampBusy = false;
  let target = 0;
  let current = 0;
  let raf = 0;

  // Scene variables only go to the few "fx" groups that use them, and only when they change.
  const varCache = {};
  const setVar = (name, value) => {
    if (varCache[name] === value) return;
    varCache[name] = value;
    for (const el of scene.fx) el.style.setProperty(name, value);
  };

  function render(t) {
    const { inset, cam } = sampleKeys(t);
    const [top, right, bottom, left] = inset;
    const w = vw - left - right;
    const h = vh - top - bottom;

    // The frame covers the whole screen and is cropped to its current shape, so reshaping it
    // never moves anything in the page layout (no layout shift, no relayout while scrolling).
    frame.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px round 10px)`;
    ring.style.clipPath = `inset(${top - 1}px ${right - 1}px ${bottom - 1}px ${left - 1}px round 11px)`;

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
      setVar(`--p${i}`, band(t, a - 0.04, b - 0.03).toFixed(3));
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
      const lit = win.t < threshold;
      if (lit !== win.on) {
        win.on = lit;
        win.el.setAttribute('fill', lit ? '#e3b04b' : '#11291f');
      }
    }

    setVar('--lamp', lampIntro.toFixed(3));

    const swing = aim * (1 - band(t, 0, 0.08)); // settles back as the story starts
    cone.setAttribute('transform', `rotate(${(swing * 26).toFixed(2)} 1315 524)`);
    pool.setAttribute('transform', `translate(${(swing * 420).toFixed(1)} 0)`);
  }

  // The loop only runs while something is moving; scrolling, resizing and the lamp wake it.
  function tick() {
    raf = 0;
    target = clamp((window.scrollY - story.offsetTop) / (story.offsetHeight - vh));
    current += (target - current) * (reduceMotion ? 1 : 0.1);
    if (Math.abs(target - current) < 0.0002) current = target;
    aim += (aimTarget - aim) * 0.08;
    if (Math.abs(aimTarget - aim) < 0.001) aim = aimTarget;
    render(current);
    if (current !== target || aim !== aimTarget || lampBusy) wake();
  }
  function wake() {
    if (!raf) raf = requestAnimationFrame(tick);
  }

  // The lamp switches on shortly after load, with a small flicker.
  function lampOn() {
    if (reduceMotion) return;
    lampBusy = true;
    const start = performance.now() + 450;
    const flicker = [[0, 0], [90, 0.7], [150, 0.15], [260, 0.85], [320, 0.4], [520, 1]];
    const step = (now) => {
      if (signal.aborted) return;
      const e = now - start;
      let v = 0;
      for (const [ms, val] of flicker) if (e >= ms) v = val;
      lampIntro = v;
      if (e < 540) requestAnimationFrame(step);
      else lampBusy = false;
      wake();
    };
    requestAnimationFrame(step);
  }

  function countUp(root) {
    if (root.dataset.counted) return;
    root.dataset.counted = '1';
    if (reduceMotion) return;
    root.querySelectorAll('[data-count]').forEach((el) => {
      const end = Number(el.dataset.count);
      const pre = el.dataset.prefix || '';
      const suf = el.dataset.suffix || '';
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
  const revealEls = document.querySelectorAll('.pairs li, .stats, .case, .person, .section__head');
  revealEls.forEach((el) => el.classList.add('reveal'));
  let io = null;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-in'));
  } else {
    io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        if (entry.target.classList.contains('stats')) countUp(entry.target);
        io.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -12% 0px' });
    revealEls.forEach((el) => io.observe(el));
  }

  const track = document.getElementById('cases');
  document.querySelectorAll('.work__nav .round').forEach((btn) => {
    on(btn, 'click', () => {
      const card = track.querySelector('.case');
      const step = card ? card.offsetWidth + 20 : 320;
      track.scrollBy({ left: step * Number(btn.dataset.dir), behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  const dimmer = document.getElementById('dimmer');
  const stops = [...dimmer.querySelectorAll('[role=tab]')];
  const desc = document.getElementById('dimmer-desc');
  const select = (i) => {
    stops.forEach((s, j) => {
      s.setAttribute('aria-selected', String(i === j));
      s.classList.toggle('is-lit', j <= i);
      s.tabIndex = i === j ? 0 : -1;
    });
    dimmer.style.setProperty('--level', (i / (stops.length - 1)).toFixed(3));
    desc.textContent = MODELS[i];
  };
  stops.forEach((s, i) => {
    on(s, 'click', () => select(i));
    on(s, 'keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      const n = clamp(i + d, 0, stops.length - 1);
      stops[n].focus();
      select(n);
    });
  });
  select(2);

  const form = document.getElementById('contact-form');
  const status = form.querySelector('.form__status');
  on(form, 'submit', (e) => {
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

  // The mobile menu is a native popover; close it when a link inside is chosen.
  const menu = document.getElementById('menu');
  menu.querySelectorAll('a').forEach((a) => on(a, 'click', () => menu.hidePopover()));

  if (!reduceMotion && matchMedia('(pointer: fine)').matches) {
    on(window, 'pointermove', (e) => {
      aimTarget = e.clientX / vw - 0.5;
      wake();
    }, { passive: true });
  }

  measure();
  chaptersEl.classList.add('is-live');
  on(window, 'resize', () => { measure(); wake(); });
  on(window, 'scroll', wake, { passive: true });
  document.fonts?.ready.then(() => { if (!signal.aborted) { measure(); wake(); } });
  if (lamp) lampOn();
  wake();

  return {
    lampOn,
    destroy() {
      ac.abort();
      cancelAnimationFrame(raf);
      io?.disconnect();
      stage.classList.remove('is-live');
    },
  };
}
