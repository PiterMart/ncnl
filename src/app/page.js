"use client";

import { useState } from 'react';
import Form from '../components/Form';
import LoadingScreen from '../components/LoadingScreen';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  return (
    <main className={styles.main}>
      {isLoading && <LoadingScreen onLoadingComplete={handleLoadingComplete} />}
      
      <div className={styles.videoContainer}>
        <video
          autoPlay
          muted
          loop
          playsInline
          className={styles.backgroundVideo}
        >
          <source src="/NCNL_VID.mp4" type="video/mp4" />
        </video>
      </div>
      <div className={styles.logoContainer}>
        <img 
          src="/NCNL_LOGO.png" 
          alt="NCNL Logo" 
          className={styles.logo}
          style={{ filter: 'brightness(0) invert(1)', width: '100%', position: 'fixed', maxWidth: '500px' }}
        />
      </div>

      <div className={styles.content}>
        <Form />
      </div>
    </main>
  );
}
