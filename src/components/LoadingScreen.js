import { useState, useEffect } from 'react';
import styles from '../styles/LoadingScreen.module.css';

export default function LoadingScreen({ onLoadingComplete, isLoading = true }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setProgress(100);
      setTimeout(() => {
        onLoadingComplete?.();
      }, 500);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onLoadingComplete?.();
          }, 500);
          return 100;
        }
        return prevProgress + 1;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [onLoadingComplete, isLoading]);

  return (
    <div className={styles.loadingContainer}>
      <div className={styles.logoContainer}>
        <img 
          src="/NCNL_LOGO.png" 
          alt="NCNL Logo" 
          className={styles.logo}
          style={{ filter: 'brightness(0) invert(1)' }}
        />
      </div>
      <div className={styles.progressBarContainer}>
        <div 
          className={styles.progressBar} 
          style={{ width: `${progress}%` }}
        />
      </div>
      {/* <div className={styles.progressText}>{progress}%</div> */}
    </div>
  );
} 