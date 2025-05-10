'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import styles from '../../../styles/product.module.css';

export default function ProductPage() {
    const [mainImage, setMainImage] = useState('/placeholders/2.WEBP');
    const [selectedSize, setSelectedSize] = useState(null);
    const productDetails = [
        '100% wool',
        'darted sleeve',
        'bout neck',
        'oversized',
        'fully lined'
    ];

    // Placeholder product data
    const product = {
        title: 'OOVERSIZED WOOL COAT',
        price: '$450',
        collection: 'FW24 RUNWAY',
        category: 'COATS',
        fullName: 'OOVERSIZED WOOL COAT FW24 RUNWAY COAT',
        shortDescription: 'A luxurious oversized wool coat from the FW24 Runway collection.',
        fullDescription: `This oversized wool coat features a darted sleeve, bout neck, and is fully lined for comfort. The 100% wool fabric ensures warmth and durability. Perfect for layering during colder months.`,
        color: 'Charcoal Grey',
        material: '100% Wool',
        modelHeight: '189cm',
        modelSize: 'M',
        sizes: ['S', 'M', 'L', 'XL'],
        sizeGuideImage: '/placeholders/size-guide.webp',
    };

    const galleryImages = [
        '/placeholders/2.WEBP',
        '/placeholders/2_2.WEBP',
        '/placeholders/2_3.WEBP',
        '/placeholders/2_4.WEBP'
    ];

    const [showSizeGuide, setShowSizeGuide] = useState(false);

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
                        style={{ objectFit: 'contain' }}
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
                                style={{ objectFit: 'contain' }}
                            />
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles.productInfo}>
                {/* Title */}
                <h1 className={styles.productName}>{product.title}</h1>
                {/* Price */}
                <p className={styles.productPrice}>{product.price}</p>
                {/* Collection & Category */}
                <div className={styles.productMeta}>
                    <span> {product.collection}</span> | <span> {product.category}</span>
                </div>
                {/* Full Name */}
                <div className={styles.productFullName}>{product.fullName}</div>
                {/* Short Description */}
                <div className={styles.productShortDescription}>{product.shortDescription}</div>
                {/* Full Description */}
                <div className={styles.productFullDescription}>{product.fullDescription}</div>
                {/* Color, Material, Model Info */}
                <div className={styles.productSpecs}>
                    <div>Color: {product.color}</div>
                    <div>Material: {product.material}</div>
                </div>
                {/* Size Selector */}
                <div className={styles.sizeSelector}>
                    <strong>Select Size:</strong>
                    <div className={styles.sizeOptions}>
                        {product.sizes.map(size => (
                            <button
                                key={size}
                                className={selectedSize === size ? styles.selectedSize : styles.sizeButton}
                                onClick={() => setSelectedSize(size)}
                                type="button"
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Size Guide Chart Button */}
                <button className={styles.sizeGuideButton} onClick={() => setShowSizeGuide(true)}>
                    Size Guide Chart
                </button>
                {showSizeGuide && (
                    <div className={styles.sizeGuideModal} onClick={() => setShowSizeGuide(false)}>
                        <div className={styles.sizeGuideContent} onClick={e => e.stopPropagation()}>
                            <Image src={product.sizeGuideImage} alt="Size Guide" width={400} height={400} />
                            <button onClick={() => setShowSizeGuide(false)}>Close</button>
                        </div>
                    </div>
                )}
                {/* Add to Cart and Wishlist Buttons */}
                <div className={styles.actionButtons}>
                    <button className={styles.buyButton} disabled={!selectedSize}>
                        ADD TO CART
                    </button>
                    {/* <button className={styles.wishlistButton}>
                        ADD TO WISHLIST
                    </button> */}
                </div>
            </div>
        </div>
    );
} 