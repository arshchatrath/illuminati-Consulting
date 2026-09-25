'use client';

import { useEffect, useRef } from 'react';
import { LOGO_LASERS, LOGO_VIEWBOX } from '../lib/logo';
import { createTerrain } from '../lib/terrain';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const out = (t) => 1 - Math.pow(1 - t, 3);
const inOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const START = 120; // ms before the lasers fire
const PULSE = 300; // ms the finished logo glows before leaving
const EXIT = 750; // ms for the hand-off
const MAX_WAIT = 4500; // never hold the page longer than this, loaded or not
const HOT = 70; // length of the white-hot stretch behind each laser, in logo units
const SOURCES = [[-520, -900], [1760, -760], [640, -1350]]; // where the beams come from, above the mark

/**
 * Cinematic loader: a glowing topographic terrain behind a logo that lasers engrave stroke by stroke.
 * - ready: true once the app has loaded; the finished logo breathes until then (max MAX_WAIT).
 * - onComplete: called after the exit animation; unmount the loader there.
 * - lasers: routes to engrave, one array of SVG path strings per laser (defaults to the Illuminati mark).
 * - viewBox: the paths' coordinate box.
 * - trace: engraving time in ms.
 * - handoffTo: CSS selector of an element the finished logo flies into; without it the logo dissolves.
 */
export default function Preloader({ ready = true, onComplete, lasers = LOGO_LASERS, viewBox = LOGO_VIEWBOX, trace = 1150, handoffTo }) {
  const bgRef = useRef(null);
  const svgRef = useRef(null);
  const readyRef = useRef(ready);
  const doneRef = useRef(onComplete);
  readyRef.current = ready;
  doneRef.current = onComplete;

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      doneRef.current?.();
      return undefined;
    }
    // Hold the page still underneath. Blocking scroll input costs nothing; toggling
    // overflow on <html> would force a full-page layout at the busiest moment.
    const hold = (e) => {
      if (e.type !== 'keydown' || [' ', 'PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) e.preventDefault();
    };
    const holdOpts = { passive: false };
    for (const type of ['wheel', 'touchmove', 'keydown']) window.addEventListener(type, hold, holdOpts);

    // The canvas is created here (not in JSX) so every mount gets a fresh WebGL context to dispose.
    const canvas = document.createElement('canvas');
    canvas.className = 'absolute inset-0 size-full';
    bgRef.current.prepend(canvas);
    // The terrain starts on the first frame, after React's start-up work. Phones skip it: starting a WebGL
    // context costs them a noticeable pause, and the laser engraving carries the moment on its own.
    let terrain = window.innerWidth < 820 ? false : null;
    const onResize = () => terrain && terrain.resize();
    window.addEventListener('resize', onResize);

    const svg = svgRef.current;
    const etch = svg.querySelector('.pl-etch');
    const ghost = svg.querySelector('.pl-ghost');
    const fill = svg.querySelector('.pl-fill');
    const routes = lasers.map((route, i) => {
      const segs = [...svg.querySelectorAll(`[data-laser="${i}"]`)].map((el, j) => ({ el, d: route[j], len: el.getTotalLength() }));
      return {
        segs,
        total: segs.reduce((sum, s) => sum + s.len, 0),
        hot: svg.querySelector(`[data-hot="${i}"]`),
        head: svg.querySelector(`[data-head="${i}"]`),
        beams: [...svg.querySelectorAll(`[data-beam="${i}"] line`)],
        grad: svg.querySelector(`#pl-beam-${i}`),
        cur: 0,
      };
    });

    const t0 = performance.now();
    let doneAt = 0;
    let exitAt = 0;
    let flight = null;
    let raf = 0;

    const frame = () => {
      const now = performance.now(); // one clock for start and frames
      const e = now - t0;
      if (terrain === null) {
        try {
          terrain = createTerrain(canvas) || false;
        } catch {
          terrain = false; // no WebGL2: the logo still engraves on the dark background
        }
      }
      const p = clamp((e - START) / trace);
      if (p >= 1 && !doneAt) doneAt = now;
      if (doneAt && !exitAt && now - doneAt > PULSE && (readyRef.current || e > MAX_WAIT)) {
        exitAt = now;
        const a = svg.getBoundingClientRect();
        const b = handoffTo ? document.querySelector(handoffTo)?.getBoundingClientRect() : null;
        flight = b && b.width ? { dx: b.left - a.left, dy: b.top - a.top, k: b.width / a.width } : null;
      }
      if (terrain) terrain.draw(e / 1000, out(clamp(e / 700)), doneAt ? (now - doneAt) / 1000 : -1);

      // Engrave: each laser walks its route at constant speed.
      for (const r of routes) {
        let left = p * r.total;
        let cur = -1;
        let local = 0;
        r.segs.forEach((s, j) => {
          const f = clamp(left / s.len);
          s.el.setAttribute('stroke-dashoffset', (1 - f).toFixed(4));
          if (cur < 0 && f < 1 && left > 0) {
            cur = j;
            local = left;
          }
          left -= s.len;
        });
        const firing = p > 0 && p < 1 && cur >= 0;
        for (const el of [r.head, r.hot, ...r.beams]) el.style.opacity = firing ? '1' : '0';
        if (!firing) continue;
        const s = r.segs[cur];
        if (r.cur !== cur) {
          r.cur = cur;
          r.hot.setAttribute('d', s.d);
        }
        const hot = Math.min(1, HOT / s.len);
        r.hot.setAttribute('stroke-dasharray', `${hot.toFixed(4)} 2`);
        r.hot.setAttribute('stroke-dashoffset', (hot - local / s.len).toFixed(4));
        const pt = s.el.getPointAtLength(local);
        const x = pt.x.toFixed(1);
        const y = pt.y.toFixed(1);
        r.head.setAttribute('transform', `translate(${x} ${y}) scale(${(0.8 + Math.random() * 0.4).toFixed(2)})`);
        for (const line of r.beams) {
          line.setAttribute('x2', x);
          line.setAttribute('y2', y);
        }
        r.grad.setAttribute('x2', x);
        r.grad.setAttribute('y2', y);
      }

      // Finish: the engraving fills in and pulses, then breathes until the page is ready.
      const since = doneAt ? now - doneAt : 0;
      const pulse = doneAt ? Math.sin(Math.PI * clamp(since / PULSE)) : 0;
      const breathe = doneAt && !exitAt && since > PULSE ? 0.5 + 0.5 * Math.sin((since - PULSE) / 420) : 0;
      fill.style.opacity = out(clamp(since / 350)).toFixed(3);
      ghost.style.opacity = (1 - clamp(since / 300)).toFixed(3);

      // Exit: the background fades away while the logo flies into place (or dissolves).
      let k = 0;
      if (exitAt) {
        const x = clamp((now - exitAt) / EXIT);
        k = inOut(x);
        bgRef.current.style.opacity = (1 - inOut(clamp(x * 1.25))).toFixed(3);
        etch.style.opacity = (1 - clamp(x * 2)).toFixed(3);
        if (flight) {
          svg.style.transform = `translate(${(flight.dx * k).toFixed(1)}px, ${(flight.dy * k).toFixed(1)}px) scale(${(1 + (flight.k - 1) * k).toFixed(4)})`;
        } else {
          svg.style.opacity = (1 - k).toFixed(3);
          svg.style.transform = `scale(${(1 + 0.06 * k).toFixed(4)})`;
        }
        if (x >= 1) {
          doneRef.current?.();
          return;
        }
      }
      svg.style.filter = `drop-shadow(0 0 ${((6 + 22 * pulse + 6 * breathe) * (1 - k)).toFixed(1)}px rgba(240, 201, 106, .55))`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      if (terrain) terrain.dispose();
      canvas.remove();
      for (const type of ['wheel', 'touchmove', 'keydown']) window.removeEventListener(type, hold, holdOpts);
    };
  }, [lasers, trace, handoffTo]);

  const all = lasers.flat();
  return (
    <div className="preloader fixed inset-0 z-[100]" role="status">
      <span className="sr-only">Loading Illuminati Consulting</span>
      <div ref={bgRef} className="absolute inset-0 bg-[#030f0c]" />
      <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
        <svg ref={svgRef} viewBox={viewBox} className="w-[min(44vw,240px)] overflow-visible" style={{ transformOrigin: '0 0' }}>
          <defs>
            <filter id="pl-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="9" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <radialGradient id="pl-head">
              <stop offset="0" stopColor="#fff" />
              <stop offset=".25" stopColor="#ffe7a8" stopOpacity=".9" />
              <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
            </radialGradient>
            {lasers.map((_, i) => SOURCES[i % SOURCES.length]).map(([x, y], i) => (
              <linearGradient key={i} id={`pl-beam-${i}`} gradientUnits="userSpaceOnUse" x1={x} y1={y} x2={x} y2={y}>
                <stop offset="0" stopColor="#ffd98a" stopOpacity="0" />
                <stop offset="1" stopColor="#fff4cf" stopOpacity=".9" />
              </linearGradient>
            ))}
          </defs>
          <g className="pl-ghost" fill="none" stroke="#c49528" strokeOpacity=".16" strokeWidth="3">
            {all.map((d, i) => <path key={i} d={d} />)}
          </g>
          <path className="pl-fill" d={all.join(' ')} fill="#f3ecd9" fillRule="evenodd" opacity="0" />
          <g className="pl-etch" fill="none" stroke="#e3b04b" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" filter="url(#pl-glow)">
            {lasers.map((route, i) => route.map((d, j) => (
              <path key={`${i}-${j}`} data-laser={i} d={d} pathLength="1" strokeDasharray="1 2" strokeDashoffset="1" />
            )))}
          </g>
          <g className="pl-hot" fill="none" stroke="#fff4cf" strokeWidth="9" strokeLinecap="round">
            {lasers.map((route, i) => <path key={i} data-hot={i} d={route[0]} pathLength="1" strokeDasharray="0 2" opacity="0" />)}
          </g>
          {lasers.map((_, i) => SOURCES[i % SOURCES.length]).map(([x, y], i) => (
            <g key={i} data-beam={i} stroke={`url(#pl-beam-${i})`}>
              <line x1={x} y1={y} x2={x} y2={y} strokeWidth="22" strokeOpacity=".25" opacity="0" />
              <line x1={x} y1={y} x2={x} y2={y} strokeWidth="5" opacity="0" />
            </g>
          ))}
          {lasers.map((_, i) => (
            <g key={i} data-head={i} opacity="0">
              <circle r="60" fill="url(#pl-head)" />
              <circle r="9" fill="#fff" />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
