import type { LandingFocusProps } from '@/lib/landingTemplates';
import styles from './LandingFocus.module.css';

/**
 * Minimal single-column landing: fast LCP (text-first), no client JS, system fonts.
 */
export function LandingFocus({
  title,
  subtitle,
  ctaHref,
  ctaLabel,
  disclosure,
  kicker,
}: LandingFocusProps) {
  return (
    <main className={styles.root}>
      <div className={styles.inner}>
        {kicker ? <span className={styles.kicker}>{kicker}</span> : null}
        <h1 className={styles.title}>{title}</h1>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        <a className={styles.cta} href={ctaHref} rel="noopener noreferrer sponsored">
          {ctaLabel}
        </a>
        {disclosure ? (
          <p className={`${styles.disclosure} ${styles.deferred}`}>
            {disclosure}
          </p>
        ) : null}
      </div>
    </main>
  );
}
