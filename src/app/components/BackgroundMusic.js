'use client';

import { useState, useEffect, useRef } from 'react';
import styles from '../../styles/BackgroundMusic.module.css';

export default function BackgroundMusic() {
  const [isMuted, setIsMuted] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    
    // Set initial volume
    audio.volume = 0.3;
    
    // Enable looping
    audio.loop = true;
    
    // Don't try to autoplay - wait for user interaction
    console.log('Background music ready - click play button to start');
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : 0.3;
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const startMusic = () => {
    if (audioRef.current && !hasStarted) {
      // Start playing (should work on user interaction)
      audioRef.current.play().then(() => {
        setHasStarted(true);
        setIsMuted(false);
        console.log('Background music started successfully');
      }).catch(error => {
        console.log('Failed to start music:', error);
      });
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className={styles.backgroundMusic}>
      <audio ref={audioRef} src="/bgMix2_1.mp3" preload="auto" />
      
      <div className={styles.controls}>
        {!hasStarted ? (
          <button 
            onClick={startMusic}
            className={styles.playButton}
            aria-label="Start background music"
          >
            ♬
          </button>
        ) : (
          <button 
            onClick={toggleMute}
            className={styles.muteButton}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? '🕨' : '🕪'}
          </button>
        )}
      </div>
    </div>
  );
}
