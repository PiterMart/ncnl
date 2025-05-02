'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import styles from '../../../styles/product.module.css';

export default function ProductPage() {
    const [mainImage, setMainImage] = useState('/placeholders/2.WEBP');
    const productDetails = [
        '100% wool',
        'darted sleeve',
        'bout neck',
        'oversized',
        'fully lined'
    ];

    const galleryImages = [
        '/placeholders/2.WEBP',
        '/placeholders/2_2.WEBP',
        '/placeholders/2_3.WEBP',
        '/placeholders/2_4.WEBP'
    ];

    return (
        <div className={styles.productContainer}>
            <div className={styles.productGallery}>
                <div className={styles.mainImage}>
                    <Image
                        src={mainImage}
                        alt="Product main image"
                        fill
                        sizes="(max-width: 508px) 100vw, 50vw"
                        priority
                        quality={100}
                        style={{ objectFit: 'cover' }}
                    />
                </div>
                <div className={styles.thumbnailContainer}>
                    {galleryImages.map((image, index) => (
                        <div 
                            key={index} 
                            className={styles.thumbnail}
                            onClick={() => setMainImage(image)}
                        >
                            <Image
                                src={image}
                                alt={`Product thumbnail ${index + 1}`}
                                fill
                                sizes="100px"
                                quality={100}
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                    ))}
                </div>
            </div>
            
            <div className={styles.productInfo}>
                <h1 className={styles.productName}>Oversized Wool Coat</h1>
                <p className={styles.productPrice}>$450</p>
                
                <div className={styles.productDetails}>
                    <h2>Details</h2>
                    <ul>
                        {productDetails.map((detail, index) => (
                            <li key={index}>{detail}</li>
                        ))}
                    </ul>
                </div>

                <button className={styles.buyButton}>
                    Add to Cart
                </button>
            </div>
        </div>
    );
} 