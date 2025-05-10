'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '../../../styles/product.module.css';
import { db } from '../../../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';

export default function ProductPage() {
    const [selectedSize, setSelectedSize] = useState(null);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);
    const params = useParams();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const productId = params.id;
                const productRef = doc(db, 'products', productId);
                const productSnap = await getDoc(productRef);

                if (productSnap.exists()) {
                    const productData = productSnap.data();
                    if (productData.images && Array.isArray(productData.images) && productData.images.length > 0) {
                        setGalleryImages(productData.images);
                    }
                    
                    setProduct({
                        title: productData.name,
                        price: productData.price,
                        collection: productData.collection,
                        category: 'COATS',
                        fullName: `${productData.name} ${productData.collection}`,
                        shortDescription: productData.description,
                        fullDescription: productData.technicalDescription,
                        color: productData.color,
                        material: productData.material,
                        modelHeight: '189cm',
                        modelSize: 'M',
                        sizes: ['S', 'M', 'L', 'XL'],
                        sizeGuideImage: '/placeholders/size-guide.webp',
                    });
                } else {
                    setError('Product not found');
                }
            } catch (err) {
                setError('Error fetching product: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [params.id]);

    const [showSizeGuide, setShowSizeGuide] = useState(false);

    if (loading) {
        return <div className={styles.productContainer}>Loading...</div>;
    }

    if (error) {
        return <div className={styles.productContainer}>Error: {error}</div>;
    }

    if (!product) {
        return <div className={styles.productContainer}>Product not found</div>;
    }

    return (
        <div className={styles.productContainer}>
            <div className={styles.productGallery}>
                {galleryImages.map((image, index) => (
                    <div key={index} className={styles.productImage}>
                        <Image
                            src={image}
                            alt={`Product image ${index + 1}`}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority={index === 0}
                            quality={100}
                            style={{ objectFit: 'contain' }}
                        />
                    </div>
                ))}
            </div>
            <div className={styles.productInfo}>
                {/* Title */}
                <h1 className={styles.productName}>{product.title}</h1>
                {/* Price */}
                <p className={styles.productPrice}>${product.price}</p>
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
                {/* Add to Cart Button */}
                <div className={styles.actionButtons}>
                    <button className={styles.buyButton} disabled={!selectedSize}>
                        ADD TO CART
                    </button>
                </div>
            </div>
        </div>
    );
} 