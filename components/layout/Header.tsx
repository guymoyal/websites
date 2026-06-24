'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { SiteConfig } from '@/lib/content';
import styles from './Header.module.css';

function normalizePath(p: string) {
  if (!p || p === '/') return '/';
  return p.replace(/\/+$/, '') || '/';
}

function isNavActive(pathname: string, href: string) {
  const p = normalizePath(pathname);
  const h = normalizePath(href);
  if (h === '/') return p === '/';
  return p === h || p.startsWith(`${h}/`);
}

interface HeaderProps {
  config: SiteConfig;
}

const Header: React.FC<HeaderProps> = ({ config }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname() || '/';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.nav}>
          <Link href="/" className={styles.logo}>
            <Image
              src="/buzz-logo.png"
              alt="AI Buzz World bee logo"
              width={80}
              height={80}
              className={styles.logoIcon}
              priority
            />
            <span className={styles.logoText}>AI Buzz World</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.desktopNav}>
            {config.navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${isNavActive(pathname, item.href) ? styles.navLinkActive : ''}`}
              >
                {item.name}
              </Link>
            ))}
            <Link href="/tools" className={styles.navCta}>
              Explore tools
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className={styles.mobileMenuButton}
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className={styles.mobileNav}>
            {config.navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.mobileNavLink} ${isNavActive(pathname, item.href) ? styles.mobileNavLinkActive : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/tools"
              className={styles.mobileNavCta}
              onClick={() => setIsMenuOpen(false)}
            >
              Explore tools
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;