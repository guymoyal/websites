import type { LandingSplitProps } from '@/lib/landingTemplates';
import styles from './LandingSplit.module.css';

/**
 * Text + hero visual: grid split on md+, single column on small screens.
 * Uses native img with explicit dimensions to limit CLS when width/height match asset.
 */
export function LandingSplit({
  title,
  subtitle,
  ctaHref,
  ctaLabel,
  disclosure,
  kicker,
  imageSrc,
  imageAlt,
  imagePriority = true,
}: LandingSplitProps) {
  return (
    <main className={styles.root}>
      <div className={styles.grid}>
        <div className={styles.copy}>
          {kicker ? <span className={styles.kicker}>{kicker}</span> : null}
          <h1 className={styles.title}>{title}</h1>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          <a className={styles.cta} href={ctaHref} rel="noopener noreferrer sponsored">
            {ctaLabel}
          </a>
          {disclosure ? <p className={styles.disclosure}>{disclosure}</p> : null}
        </div>
        <div className={styles.visual}>
          <figure className={styles.figure}>
            {/* eslint-disable-next-line @next/next/no-img-element -- intentional: zero JS, predictable LCP for static export */}
            <img
              className={styles.image}
              src={imageSrc}
              alt={imageAlt}
              width={1344}
              height={768}
              decoding="async"
              fetchPriority={imagePriority ? 'high' : 'low'}
              loading={imagePriority ? 'eager' : 'lazy'}
            />
          </figure>
        </div>
      </div>
    </main>
  );
}
