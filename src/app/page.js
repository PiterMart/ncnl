"use client";

import { useState, useRef, useEffect } from 'react';
import Form from '../components/Form';
import LoadingScreen from '../components/LoadingScreen';
import styles from '../styles/Home.module.css';
import Display from './components/Display';
import Image from 'next/image';
import Video from './components/Video';

export default function Home() {

  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  return (
    <main className={styles.main}>
      {/* {isLoading && <LoadingScreen onLoadingComplete={handleLoadingComplete} />} */}
    
      {/* <div className={styles.logoContainer}>
        <img 
          src="/textura-fotocopia.jpg" 
          alt="NCNL Logo" 
          className={styles.logo}
          style={{ filter: 'brightness(0) invert(1)', width: '100%', position: 'fixed', mixBlendMode: 'screen'}}
        />
      </div> */}

      <div >
        {/* <Form /> */}
        {/* <Display /> */}
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'row', backgroundColor: 'aliceblue', paddingTop: '10rem' }}>
        <button
            style={{
              position: 'absolute',
              top: '25%',
              left: '25%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#110708',
              color: 'white',
              padding: '1rem 2rem',
              border: 'none',
              fontSize: '1.25rem',
              cursor: 'pointer',
              zIndex: 10,
            }}
          >
            CAPSULE - 01
          </button>
          <div style={{ position: 'relative', width: '100%', height: '100%',aspectRatio: '3 / 4'  }}>
            <Image
              src="/picture-left.png"
              alt="placeholder"
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
          {/* <div style={{ position: 'relative', width: '50%', height: '100%' }}>
            <Image
              src="/picture-right.png"
              alt="placeholder"
              fill
              style={{ objectFit: 'contain' }}
            />
          </div> */}
        </div>
        {/* <div style={{height: "100vh"}}></div> */}
        <Video />
      </div>
    </main>
  );
}
