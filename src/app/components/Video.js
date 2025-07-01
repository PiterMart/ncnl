import { useRef, useEffect, useState } from 'react';
import styles from '../../styles/Video.module.css';
import Link from 'next/link';
import Image from 'next/image'; // Import the Image component from Next.js

export default function Video() {
  const videoRef = useRef(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false); // New state to track video loading

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.0;
      // Set videoLoaded to true when video can play through
      videoRef.current.addEventListener('canplaythrough', () => {
        setVideoLoaded(true);
      });
      // Handle cases where video might not load (e.g., network error, unsupported format)
      videoRef.current.addEventListener('error', () => {
        console.error('Error loading video, displaying fallback image.');
        setVideoLoaded(false); // Ensure image is shown if video errors out
      });
    }
  }, []);

  const handleSeeRunway = async () => {
    setShowPlayer(true);

    if (screen.orientation && screen.orientation.lock) {
      try {
        await screen.orientation.lock('landscape');
      } catch (err) {
        console.warn('Orientation lock failed:', err);
      }
    }
  };

  const handleClose = () => {
    setShowPlayer(false);
  };

  return (
    <div className={styles.videoWrapper}>
      <div className={styles.videoContainer}>
        {/* Fallback Image - always present, but hidden when video loads */}
        {!videoLoaded && (
          <Image
            src="/heroimage.png" // **CHANGE THIS TO YOUR IMAGE PATH**
            alt="Video loading background"
            layout="fill" // Makes the image fill the parent container
            objectFit="cover" // Covers the area without distortion
            className={styles.fallbackImage}
            priority // Prioritize loading this image
          />
        )}

        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className={`${styles.backgroundVideo} ${videoLoaded ? styles.videoLoaded : ''}`}
        >
          <source src="/NCNL_RUNWAY_FINAL_2.mp4" type="video/mp4" />
        </video>

        {/* "SHOP" Button */}
        <Link className={styles.runwayButton} href="/shop">
          <p>SHOP</p>
        </Link>

        {/* Scrolling Text (commented out in your original code, kept as is) */}
        <div className={styles.scrollTextContainer}>
          {/* <div className={styles.scrollText}>...</div> */}
        </div>
      </div>

      {/* Modal Video Player */}
      {showPlayer && (
        <div className={styles.modalOverlay} onClick={handleClose}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <video controls autoPlay className={styles.modalVideo}>
              <source src="/NCNL_RUNWA_ALTA_1.mp4" type="video/mp4" />
            </video>
            <button className={styles.closeButton} onClick={handleClose}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}