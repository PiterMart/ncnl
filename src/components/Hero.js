'use client';

import { useRef, useState } from 'react';
import TypeIt from 'typeit';
import Link from 'next/link';
import styles from '../styles/Hero.module.css';

export default function Hero() {
  const typeRef = useRef(null);
  const typeInstance = useRef(null);
  const isTyping = useRef(false);
  const [showShop, setShowShop] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const fullText = 'LA NOTICIA ';

  const handleMouseEnter = () => {
    if (isTyping.current || hasAnimated) return;
    isTyping.current = true;

    typeInstance.current = new TypeIt(typeRef.current, {
      speed: 80,
      cursor: false,
      lifeLike: true,
      loop: false,
      afterComplete: () => {
        isTyping.current = false;
        setTimeout(() => {
          setShowShop(true);
        }, 10);
        setHasAnimated(true);
      },
    })
      .empty()
      .type(fullText)
      .go();
  };

  return (
    <div>
      <div className={styles.container} style={{ cursor: hasAnimated ? 'default' : 'pointer' }}>
        <div className={styles.imageContainer}>
            <div className={styles.textContainer}>
                <div
                    ref={typeRef}
                    className={styles.typingText}
                />
                          {/* <img style={{ width: '200px', height: 'auto' }} src="/la-piedad-logo.png" alt="LA PIEDAD" /> */}
                <Link 
                    href="/shop"
                    className={`${styles.shopLink} ${showShop ? styles.visible : ''}`}
                >
                   <p className={styles.shopText}> Comprar {"^"} </p>
                </Link>
            </div>
          <video
            onMouseEnter={handleMouseEnter}
            src="/lanoticia/0.SHORT.360.mp4"
            autoPlay
            muted
            loop
            playsInline
            style={{ objectFit: 'contain', width: 'auto', height: '100%' }}
          />
        </div>
      </div>
    </div>
  );
}
