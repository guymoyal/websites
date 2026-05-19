'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isEzoicActive } from '@/lib/ezoic';

/** Batches showAds(site-wide placeholders on the current DOM) once per navigation. */

function flushEzoicAds(): void {
  if (typeof window === 'undefined') return;
  window.ezstandalone = window.ezstandalone || {};
  const ez = window.ezstandalone;
  ez.cmd = ez.cmd || [];

  const els = document.querySelectorAll('[id^="ezoic-pub-ad-placeholder-"]');
  const ids = [...els]
    .map((el) => parseInt(el.id.replace(/^ezoic-pub-ad-placeholder-/, ''), 10))
    .filter((n) => Number.isFinite(n));

  const uniq = [...new Set(ids)];
  if (!uniq.length) return;

  ez.cmd.push(function () {
    const g = window.ezstandalone as typeof window.ezstandalone & {
      showAds?: (...placementIds: number[]) => void;
    };
    if (typeof g?.showAds === 'function') {
      g.showAds(...uniq);
    }
  });
}

export default function EzoicRunner() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isEzoicActive()) return;
    const timer = window.setTimeout(flushEzoicAds, 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return null;
}
