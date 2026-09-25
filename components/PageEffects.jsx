'use client';

import { useEffect } from 'react';
import { initPage } from '../lib/story';

// The page is server-rendered HTML; this switches on the motion once it's in the browser.
export default function PageEffects() {
  useEffect(() => initPage(), []);
  return null;
}
