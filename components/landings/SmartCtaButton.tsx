'use client';

/**
 * Ad-blocker-resistant affiliate CTA (part 2 of the two-part fix; part 1 is
 * the server-side /go/<slug>/ 302 in src/worker.ts).
 *
 * Blockers with $popup rules let the click happen but kill the new tab the
 * moment it navigates to the tracker — the user sees a tab flash and nothing
 * else. So: try window.open, and if it returns null (blocked outright) or the
 * tab is closed 1s later (opened-then-killed), navigate the SAME tab instead —
 * same-tab navigation isn't matched by popup rules.
 *
 * Deliberately no "noopener" in the window.open call: with it the call returns
 * null immediately and the closed-tab check becomes impossible. The anchor
 * keeps rel="noopener" for the no-JS path.
 */
export function SmartCtaButton({
  href,
  label,
  className,
  children,
}: {
  href: string; // first-party redirect, e.g. "/go/fiverr-many-geos-2/"
  label?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    // Let modifier-clicks (open in new tab, copy link, middle-click) behave normally.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();

    let win: Window | null = null;
    try {
      win = window.open(href, '_blank');
    } catch {
      win = null;
    }

    if (!win) {
      window.location.href = href; // popup blocked outright → same tab
      return;
    }

    // Some blockers open then immediately close the tab. After 1s, recover.
    window.setTimeout(() => {
      let closed = false;
      try {
        closed = win!.closed;
      } catch {
        closed = false; // cross-origin but alive — leave it open
      }
      if (closed) window.location.href = href;
    }, 1000);
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      target="_blank"
      rel="sponsored nofollow noopener noreferrer"
      className={className}
    >
      {children ?? label}
    </a>
  );
}
