'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '../../firebase/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { usePathname } from 'next/navigation';
import { useCart } from '../../contexts/CartContext';
import CartModal from '../../components/CartModal';
import styles from '../../styles/nav.module.css';

export default function Nav() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [hasScrolled, setHasScrolled] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const currentPath = usePathname();
    const { items } = useCart();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });
  
      return () => unsubscribe();
    }, []);
  
    const handleLogout = async () => {
      try {
        await signOut(auth);
        router.push('/');
      } catch (error) {
        console.error('Error signing out:', error);
      }
    };

    const pages = [
        { name: 'SHOP', path: '/shop', delay: '0s' },
        { name: 'HELP', path: '/hope', delay: '0.1s' },
        { name: 'CONTACT', path: '/contact', delay: '0.2s' },
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

    if (loading) {
        return null;
    }

    return (
        <div className={`${styles.nav} ${hasScrolled ? styles.nav_scrolled : styles.nav_transparent} ${!isVisible ? styles.nav_hidden : ''}`}>
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
                        <CartModal 
                            isOpen={isCartOpen} 
                            onClose={() => setIsCartOpen(false)} 
                        />
                </ul>
                <div className={styles.rightSection}>
                    <div className={styles.cartSection}>
                        <button 
                            className={styles.cartButton}
                            onClick={() => setIsCartOpen(true)}
                        >
                            <span className={styles.cartCounter}>
                                [{items.length}]
                            </span>
                            CART
                        </button>
                    </div>
                    {user ? (
                        <div className={styles.userInfo}>
                            <button
                                onClick={handleLogout}
                                className={styles.logoutButton}
                            >
                                LOGOUT
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className={styles.loginButton}
                        >
                            LOGIN
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
