'use client';

import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation'; // Removed
import Link from 'next/link';
import Image from 'next/image';
// import { auth } from '../../firebase/firebaseConfig'; // Removed
// import { onAuthStateChanged, signOut } from 'firebase/auth'; // Removed
import { usePathname } from 'next/navigation';
import { useCart } from '../../contexts/CartContext';
import CartModal from '../../components/CartModal';
import styles from '../../styles/nav.module.css';

// Custom hook for media queries
const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, [matches, query]);

    return matches;
};

export default function Nav() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [hasScrolled, setHasScrolled] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const currentPath = usePathname();
    const { items } = useCart();
    const isMobile = useMediaQuery('(max-width: 768px)');

    // const [user, setUser] = useState(null); // Removed
    // const [loading, setLoading] = useState(true); // Removed
    // const router = useRouter(); // Removed

    // useEffect(() => { // Removed Firebase auth listener
    //   const unsubscribe = onAuthStateChanged(auth, (user) => {
    //     setUser(user);
    //     setLoading(false);
    //   });
    //
    //   return () => unsubscribe();
    // }, []);

    // const handleLogout = async () => { // Removed
    //   try {
    //     await signOut(auth);
    //     router.push('/');
    //   } catch (error) {
    //     console.error('Error signing out:', error);
    //   }
    // };

    const pages = [
        { name: 'SHOP', path: '/shop', delay: '0s' },
        { name: 'ABOUT', path: '/about', delay: '0.1s' },
        { name: 'HELP', path: '/ayuda', delay: '0.2s' },
        { name: 'CONTACT', path: '/contact', delay: '0.3s' },
    ];

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const isCurrent = (path) => currentPath === path;

    const controlNavbar = () => {
        if (typeof window !== 'undefined') {
            setHasScrolled(window.scrollY > 50);
            // Show navbar if scrolling up, or if at the very top
            if (window.scrollY < lastScrollY || window.scrollY < 50) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
            setLastScrollY(window.scrollY);
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', controlNavbar);
            return () => window.removeEventListener('scroll', controlNavbar);
        }
    }, [lastScrollY]); // lastScrollY dependency ensures re-evaluation if needed

    // if (loading) { // Removed
    //   return null;
    // }

    return (
        <div className={`${styles.nav} ${hasScrolled ? styles.nav_scrolled : styles.nav_transparent} ${!isVisible && hasScrolled ? styles.nav_hidden : ''} ${currentPath === '/' ? styles.nav_white : styles.nav_black}`}>
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
            <div className={styles.rightSection}>
                    <div className={styles.cartSection}>
                        {isMobile ? (
                            <Link 
                                href="/cart" 
                                className={styles.cartButton}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span className={styles.cartCounter}>
                                    {items.length}
                                </span>
                                <p>BAG</p>
                            </Link>
                        ) : (
                            <button
                                className={styles.cartButton}
                                onClick={() => setIsCartOpen(true)}
                            >
                                <span className={styles.cartCounter}>
                                    {items.length}
                                </span>
                                <p>BAG</p>
                            </button>
                        )}
                    </div>
                    {/* Removed UserInfo and Login/Logout Link */}
                </div>
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
                    {/* CartModal is kept as it's part of cart functionality, not auth */}
                    <CartModal
                        isOpen={isCartOpen}
                        onClose={() => setIsCartOpen(false)}
                    />
                </ul>
            </div>
        </div>
    );
}
