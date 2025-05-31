'use client';
import { useState } from 'react';
import styles from '../styles/ExpandableSection.module.css';

export default function ExpandableSection({ title, children, defaultExpanded = false }) {
    const [isOpen, setIsOpen] = useState(defaultExpanded);

    return (
        <div className={styles.container}>
            <button 
                className={styles.header} 
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <span className={styles.title}>{title}</span>
                <span className={styles.icon}>{isOpen ? '-' : '+'}</span>
            </button>
            <div 
                className={`${styles.content} ${isOpen ? styles.open : ''}`}
                style={{
                    maxHeight: isOpen ? '1000px' : '0',
                    opacity: isOpen ? 1 : 0
                }}
            >
                {children}
            </div>
        </div>
    );
} 