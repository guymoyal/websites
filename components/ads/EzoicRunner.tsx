'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isEzoicActive } from '@/lib/ezoic';

/**
 * Step 3: queue showAds after sa.min.js processes cmd — see
 * https://docs.ezoic.com/docs/ezoicads/implementation/
 * Do not guard on showAds before pushing; the queue runs when the library is ready.
 */

function collectPlaceholderIds(): number[] {
  if (typeof document === 'undefined') return [];
  const els = document.querySelectorAll('[id^="ezoic-pub-ad-placeholder-"]');
  const ids = [...els]
    .map((el) => parseInt(el.id.replace(/^ezoic-pub-ad-placeholder-/, ''), 10))
    .filter((n) => Number.isFinite(n));
  return [...new Set(ids)];
}

function queueEzoicShowAds(): void {
  if (typeof window === 'undefined') return;
  window.ezstandalone = window.ezstandalone || {};
  window.ezstandalone.cmd = window.ezstandalone.cmd || [];
  const ids = collectPlaceholderIds();

  window.ezstandalone.cmd.push(function () {
    const root = window.ezstandalone;
    if (!root || typeof root.showAds !== 'function') return;
    if (ids.length > 0) {
      root.showAds(...ids);
    } else {
      root.showAds();
    }
  });
}

export default function EzoicRunner() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isEzoicActive()) return;

    queueEzoicShowAds();

    const onLoad = () => queueEzoicShowAds();
    if (document.readyState === 'complete') {
      onLoad();
    } else {
      window.addEventListener('load', onLoad);
    }

    const delayed = window.setTimeout(queueEzoicShowAds, 1500);

    return () => {
      window.removeEventListener('load', onLoad);
      window.clearTimeout(delayed);
    };
  }, [pathname]);

  return null;
}
