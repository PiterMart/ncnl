'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from '../../styles/nav.module.css';

export default function Nav() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [hasScrolled, setHasScrolled] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const currentPath = usePathname();

    const pages = [
        { name: 'SHOP', path: '/shop', delay: '0s' },
        { name: 'ABOUT', path: '/about', delay: '0.1s' },
        { name: 'HELP', path: '/hope', delay: '0.2s' },
        { name: 'CONTACT', path: '/contact', delay: '0.3s' },
    ];

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const isCurrent = (path) => currentPath === path;

    const controlNavbar = () => {
        if (typeof window !== 'undefined') {
            setHasScrolled(window.scrollY > 50);
            setIsVisible(window.scrollY < lastScrollY);
            setLastScrollY(window.scrollY);
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', controlNavbar);
            return () => window.removeEventListener('scroll', controlNavbar);
        }
    }, [lastScrollY]);

    return (
        <div className={`${styles.nav} ${hasScrolled ? styles.nav_scrolled : styles.nav_transparent}`}>
            <Link href="/" onClick={() => setIsMenuOpen(false)}>
            <img 
                src="/NCNL_LOGO.png" 
                alt="NCNL Logo" 
                className={styles.logo}
                style={{ width: '100%', position: 'fixed', maxWidth: '500px', top: "1rem" }}
                />
            </Link>
            <button className={`${styles.navButton} ${isMenuOpen ? styles.open : ''}`} onClick={toggleMenu}>
                <span className={styles.bar}></span>
                <span className={styles.bar}></span>
                <span className={styles.bar}></span>
            </button>
            <div className={`${styles.nav_list} ${isMenuOpen ? styles.active : ''}`} id="navMenu">
                <ul>
                    {pages.map((page, index) => (
                        <li key={index} style={{ '--delay': page.delay }}>
                            <Link
                                href={page.path}
                                className={isCurrent(page.path) ? styles.page_current : ''}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {page.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
