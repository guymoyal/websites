import React from 'react';
import styles from './LegalLayout.module.css';

interface LegalLayoutProps {
  title: string;
  updated: string;
  children: React.ReactNode;
}

/**
 * Shared presentational wrapper for static legal pages (privacy, terms,
 * disclaimer). Renders the single page <h1> in the hero so article bodies
 * only use <h2>/<h3>.
 */
export default function LegalLayout({ title, updated, children }: LegalLayoutProps) {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.updated}>Last updated: {updated}</p>
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
