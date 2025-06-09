"use client";

import { useState, useEffect } from 'react';
import LoadingScreen from '../components/LoadingScreen';
import styles from '../styles/Home.module.css';
import Video from './components/Video';
import Hero from '../components/Hero';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [contentLoaded, setContentLoaded] = useState(false);

  useEffect(() => {
    // Simulate initial content loading
    const timer = setTimeout(() => {
      setContentLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  return (
    <main className={styles.main}>
      {isLoading && <LoadingScreen onLoadingComplete={handleLoadingComplete} isLoading={!contentLoaded} />}

      <div style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.5s ease' }}>
        <Video />
        {/* <div className={styles.ticket}>
          <img src="/ticket-web.png" alt="Ticket" className={styles.ticketImage}/>
        </div> */}
        {/* <Hero /> */}
      </div>
    </main>
  );
}
