import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import styles from './CompareToolsStrip.module.css';

const COMPARISONS = [
  {
    title: 'ChatGPT, Claude & Gemini',
    href: '/tools/chatgpt',
    blurb: 'Start with ChatGPT, then compare Claude and Gemini in our directory.',
  },
  {
    title: 'Best AI coding assistants',
    href: '/category/developer-tools',
    blurb: 'Cursor, Copilot, Codeium, and more — browse by category.',
  },
  {
    title: 'Top writing & content tools',
    href: '/blog/best-ai-writing-tools-for-content-creators-in-2025',
    blurb: 'Editorial guide plus tools for drafts, SEO, and publishing.',
  },
];

export default function CompareToolsStrip() {
  return (
    <section className={styles.section} aria-labelledby="compare-tools-heading">
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 id="compare-tools-heading" className={styles.title}>
            Compare &amp; choose faster
          </h2>
          <p className={styles.subtitle}>
            Start with a guide or jump straight into a category — built for visitors comparing options.
          </p>
        </div>
        <ul className={styles.grid}>
          {COMPARISONS.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={styles.card}>
                <span className={styles.cardTitle}>{item.title}</span>
                <span className={styles.cardBlurb}>{item.blurb}</span>
                <span className={styles.cardCta}>
                  Explore
                  <ArrowRight size={16} aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className={styles.footer}>
          <Link href="/tools" className={styles.allTools}>
            Browse all tools
            <ArrowRight size={18} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
