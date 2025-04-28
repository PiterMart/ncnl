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
          <source src="https://firebasestorage.googleapis.com/v0/b/ncnl-9fd04.firebasestorage.app/o/video%2FNCNL_VID.mp4?alt=media&token=860598dc-8a60-4aa0-b979-7fe9e19d86cf" type="video/mp4" />
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
