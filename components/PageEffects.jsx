'use client';

import { useEffect, useRef, useState } from 'react';
import Preloader from './Preloader';
import { initPage } from '../lib/story';

// The page is server-rendered HTML; this switches on the motion once it's in the browser.
// The preloader is server-rendered too (so nothing flashes before it); returning visitors,
// reduced-motion users and no-JS visitors never see it (see the head script in app/layout.jsx).
export default function PageEffects() {
  const [intro, setIntro] = useState(true);
  const [ready, setReady] = useState(false);
  const page = useRef(null);

  useEffect(() => {
    const seen = document.documentElement.classList.contains('seen');
    page.current = initPage({ lamp: seen });
    if (seen) setIntro(false);
    let alive = true;
    const loaded = () => document.fonts.ready.then(() => alive && setReady(true));
    if (document.readyState === 'complete') loaded();
    else window.addEventListener('load', loaded, { once: true });
    return () => {
      alive = false;
      window.removeEventListener('load', loaded);
      page.current.destroy();
    };
  }, []);

  if (!intro) return null;
  return (
    <Preloader
      ready={ready}
      handoffTo=".nav__brand img"
      onComplete={() => {
        try {
          sessionStorage.setItem('ic-intro', '1');
        } catch {}
        document.documentElement.classList.add('seen'); // reveals the nav logo the preloader just landed on
        setIntro(false);
        page.current?.lampOn();
      }}
    />
  );
}
