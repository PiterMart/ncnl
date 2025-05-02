'use client';
import styles from '../../styles/Display.module.css';

export default function Display() {

    return (
        <div>
            <div className={styles.display}>
                <div className={styles.card}>
                    <div className={styles.card_text}>
                        <p>NCNL</p>
                    </div>
                    <img 
                        src="/placeholders/2.webp" 
                        alt="placeholder" 
                        className={styles.logo}
                        style={{ width: '100%', maxWidth: '300px', top: "1rem" }}
                    />
                </div>
                <div className={styles.card}>
                    <div className={styles.card_text}>
                        <p>NCNL</p>
                    </div>
                    <img 
                        src="/placeholders/1.webp" 
                        alt="placeholder" 
                        className={styles.logo}
                        style={{ width: '100%', maxWidth: '300px', top: "1rem" }}
                    />
                </div>
                <div className={styles.card}>
                    <div className={styles.card_text}>
                        <p>NCNL</p>
                    </div>
                    <img 
                        src="/placeholders/2.webp" 
                        alt="placeholder" 
                        className={styles.logo}
                        style={{ width: '100%', maxWidth: '300px', top: "1rem" }}
                    />
                </div>
                <div className={styles.card}>
                    <div className={styles.card_text}>
                        <p>NCNL</p>
                    </div>
                    <img 
                        src="/placeholders/1.webp" 
                        alt="placeholder" 
                        className={styles.logo}
                        style={{ width: '100%', maxWidth: '300px', top: "1rem" }}
                    />
                </div>
            </div>
        </div>
    );
}
