'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import styles from '../../../styles/product.module.css';
import { db } from '../../../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import ExpandableSection from '../../../components/ExpandableSection';
import Display from '@/app/components/Display'; // Assuming this is used elsewhere or needed
import LoadingScreen from '../../../components/LoadingScreen';
import { useCart } from '../../../contexts/CartContext';
import ProductImage from '../../../components/ProductImage';
import { formatPrice } from '../../../utils/priceUtils';

// Import Lightbox components and styles
import 'yet-another-react-lightbox/styles.css';
// Import the NextJsImage plugin for rendering Next.js Image components
import Lightbox from 'yet-another-react-lightbox';
import NextJsImage from "../../../components/NextJsImage";

export default function ProductPage() {
    const [selectedSize, setSelectedSize] = useState(null);
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [contentLoaded, setContentLoaded] = useState(false);
    const [error, setError] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);
    const params = useParams();
    const router = useRouter();
    const { addItem } = useCart();

    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Array of sold out products
    const soldoutProducts = ["La Piedad", "LA BESTIA"];

    const handleLoadingComplete = () => {
        setIsLoading(false);
    };

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
                        shortDescription: productData.description,
                        fullDescription: productData.technicalDescription,
                        color: productData.color,
                        material: productData.material,
                        sizes: productData.sizes && Array.isArray(productData.sizes) && productData.sizes.length > 0
                            ? productData.sizes
                            : ['S', 'M', 'L', 'XL'],
                        sizeGuideImage: productData.sizeGuideImage || '/placeholders/size-guide.webp',
                        mainImage: productData.images?.[0],
                        collection: productData.collection,
                        category: productData.category || "", // NEW: load category
                    });
                    setContentLoaded(true);
                } else {
                    setError('Product not found');
                    setContentLoaded(true);
                }
            } catch (err) {
                setError('Error fetching product: ' + err.message);
                setContentLoaded(true);
            }
        };

        fetchProduct();
    }, [params.id]);

    const [showSizeGuide, setShowSizeGuide] = useState(false);

    /**
     * Handle adding product to cart and navigate to /cart
     * @param {object} product
     */
    const handleAddToCart = (product) => {
        try {
            if (product.sizes && product.sizes.length > 0 && !selectedSize) {
                alert('Please select a size.');
                return;
            }

            addItem({
                id: params.id,
                name: product.title,
                price: product.price,
                quantity: 1,
                size: selectedSize,
                mainImage: product.mainImage,
                collection: product.collection,
                color: product.color,
                category: product.category, // NEW: pass category if needed
            });
            router.push("/cart");
        } catch (err) {
            console.error("Error adding product to cart:", err);
        }
    };

    const slides = galleryImages.map(image => ({ src: image }));

    return (
        <main className={styles.productContainer}>
            {isLoading && (
                <LoadingScreen
                    onLoadingComplete={handleLoadingComplete}
                    isLoading={!contentLoaded}
                />
            )}

            {!isLoading && error && (
                <div className={styles.errorContainer}>
                    <h2>{error}</h2>
                </div>
            )}

            {!isLoading && !error && product && (
                <div
                    style={{
                        opacity: isLoading ? 0 : 1,
                        transition: 'opacity 0.5s ease',
                        width: '100%',
                        height: '100%',
                        margin: '0',
                        padding: '0'
                    }}
                >
                    <div className={styles.productGallery}>
                        {galleryImages.map((image, index) => (
                            <div
                                key={index}
                                className={styles.productImage}
                                onClick={() => {
                                    setCurrentImageIndex(index);
                                    setLightboxOpen(true);
                                }}
                                style={{ cursor: 'pointer' }}
                            >
                                <ProductImage
                                    src={image}
                                    alt={`Product image ${index + 1}`}
                                    className={styles.productImage}
                                    objectFit="contain"
                                    style={{
                                        width: '100%',
                                        height: '100%'
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    <div className={styles.productInfo}>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.5rem' }}>
                            <p className={styles.productName} style={{ marginBottom: '7px', transform: 'NONE' }}>{product.category}</p>
                            <p className={styles.productName}>{product.title}</p>
                            <p className={styles.productPrice}>
                                {soldoutProducts.includes(product.title) ? "SOLD OUT" : `$ ${formatPrice(product.price)}`}
                            </p>
                        </div>
                        <div className={styles.productShortDescription}>
                            <span>{product.collection}</span>
                        </div>

                        <ExpandableSection
                            title=""
                            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                            defaultExpanded={true}
                        >
                            <div className={styles.productShortDescription}>
                                {product.shortDescription}
                            </div>
                            <div className={styles.productShortDescription}>
                                Material: {product.material}
                            </div>
                            <div className={styles.productShortDescription}>
                                Color: {product.color}
                            </div>
                            <div className={styles.productShortDescription}>
                                {product.fullDescription}
                            </div>
                        </ExpandableSection>

                        {product.sizes && product.sizes.length > 0 && !soldoutProducts.includes(product.title) && (
                            <div className={styles.sizeSelector}>
                                <div className={styles.productShortDescription}>
                                    ELEGÍ EL TALLE:
                                </div>
                                <div className={styles.sizeOptions}>
                                    {product.sizes.map(size => (
                                        <button
                                            key={size}
                                            className={
                                                selectedSize === size
                                                    ? styles.selectedSize
                                                    : styles.sizeButton
                                            }
                                            onClick={() => setSelectedSize(size)}
                                            type="button"
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {showSizeGuide && product.sizeGuideImage && (
                            <div
                                className={styles.sizeGuideModal}
                                onClick={() => setShowSizeGuide(false)}
                            >
                                <div
                                    className={styles.sizeGuideContent}
                                    onClick={e => e.stopPropagation()}
                                >
                                    <ProductImage
                                        src={product.sizeGuideImage}
                                        alt="Size Guide"
                                        objectFit="contain"
                                        style={{
                                            width: '400px',
                                            height: '400px'
                                        }}
                                    />
                                    <button onClick={() => setShowSizeGuide(false)}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className={styles.actionButtons}>
                            {!soldoutProducts.includes(product.title) && (
                                <button
                                    onClick={() => handleAddToCart(product)}
                                    className={styles.buyButton}
                                    disabled={product.sizes && product.sizes.length > 0 && !selectedSize}
                                >
                                    ADD TO BAG
                                </button>
                            )}
                            <button className={styles.shopButton} onClick={() => router.push("/shop")}>
                                BACK TO SHOP
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {product && galleryImages.length > 0 && (
                <Lightbox
                    open={lightboxOpen}
                    close={() => setLightboxOpen(false)}
                    slides={slides}
                    index={currentImageIndex}
                    render={{ slide: NextJsImage }}
                />
            )}
        </main>
    );
}
