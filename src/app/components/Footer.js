'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '../../styles/footer.module.css';

export default function Footer() {
    const currentPath = usePathname();

    const pages = [
        { name: 'TIENDA', path: '/shop' },
        { name: 'AYUDA', path: '/ayuda' },
        { name: 'CONTACT', path: '/contact' },
        { name: 'PRIVACY POLICY', path: '/politica-de-privacidad' },
        { name: 'TERMS AND CONDITIONS', path: '/terminos-y-condiciones' },
    ];

    const isCurrent = (path) => currentPath === path;

    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                {/* <div className={styles.footerLogo}>
                    <Link href="/">
                        <img 
                            src="/NCNL_LOGO.png" 
                            alt="NCNL Logo" 
                            className={styles.logo}
                        />
                    </Link>
                </div> */}
                <nav className={styles.footerNav}>
                    <ul>
                        {pages.map((page, index) => (
                            <li key={index}>
                                <Link
                                    href={page.path}
                                    className={isCurrent(page.path) ? styles.page_current : ''}
                                >
                                    |  {page.name} |
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </footer>
    );
} 