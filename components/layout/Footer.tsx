import React from 'react';
import Link from 'next/link';
import { Twitter, Linkedin, Github } from 'lucide-react';
import { SiteConfig } from '@/lib/content';
import styles from './Footer.module.css';

interface FooterProps {
  config: SiteConfig;
}

const Footer: React.FC<FooterProps> = ({ config }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.brand}>
            <h3 className={styles.brandName}>{config.name}</h3>
            <p className={styles.brandDescription}>{config.description}</p>
          </div>

          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>Navigation</h4>
              <ul className={styles.linkList}>
                {config.navigation.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={styles.link}>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>Resources</h4>
              <ul className={styles.linkList}>
                <li>
                  <Link href="/blog" className={styles.link}>
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/compare" className={styles.link}>
                    Comparisons
                  </Link>
                </li>
                <li>
                  <Link href="/sitemap.xml" className={styles.link}>
                    Sitemap
                  </Link>
                </li>
              </ul>
            </div>

            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>Legal</h4>
              <ul className={styles.linkList}>
                <li>
                  <Link href="/privacy" className={styles.link}>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className={styles.link}>
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/disclaimer" className={styles.link}>
                    Disclaimer
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className={styles.social}>
            <h4 className={styles.socialTitle}>Follow Us</h4>
            <div className={styles.socialLinks}>
              <a
                href={config.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href={config.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href={config.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {currentYear} {config.name}. All rights reserved.
          </p>
          <p className={styles.credits}>
            Built with Next.js and powered by AI
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;