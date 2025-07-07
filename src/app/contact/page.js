'use client';

import styles from '../../styles/contact.module.css';

export default function ContactPage() {
    return (
        <main className={styles.container}>
            <h1 className={styles.title}>CONTACT</h1>
            <div className={styles.contactList}>
                <div className={styles.contactItem}>
                    <a href="mailto:contact@ncnl.com" className={styles.email}>contact@ncnl.com</a>
                </div>
            </div>
        </main>
    );
}
