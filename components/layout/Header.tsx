'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { SiteConfig } from '@/lib/content';
import styles from './Header.module.css';

interface HeaderProps {
  config: SiteConfig;
}

const Header: React.FC<HeaderProps> = ({ config }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.nav}>
          <Link href="/" className={styles.logo}>
            <Image
              src="/images/ai-buzz-logo.png"
              alt="AI Buzz World"
              width={200}
              height={60}
              className={styles.logoImage}
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className={styles.desktopNav}>
            {config.navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={styles.navLink}
              >
                {item.name}
              </Link>
            ))}
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
                className={styles.mobileNavLink}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;