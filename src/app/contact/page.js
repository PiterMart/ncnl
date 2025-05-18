'use client';

import styles from '../../styles/contact.module.css';

export default function ContactPage() {
    return (
        <main className={styles.container}>
            <h1 className={styles.title}>CONTACT</h1>
            <div className={styles.contactList}>
                <div className={styles.contactItem}>
                    <span className={styles.name}>XUL</span>
                    <a href="mailto:xul@ncnl.com" className={styles.email}>xul@ncnl.com</a>
                </div>
                <div className={styles.contactItem}>
                    <span className={styles.name}>PAULINO</span>
                    <a href="mailto:paulino@ncnl.com" className={styles.email}>paulino@ncnl.com</a>
                </div>
            </div>
        </main>
    );
}
