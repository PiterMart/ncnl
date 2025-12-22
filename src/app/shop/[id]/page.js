'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import styles from '../../../styles/product.module.css';
import { db } from '../../../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import ExpandableSection from '../../../components/ExpandableSection';
import Display from '@/components/Display'; // Assuming this is used elsewhere or needed
import LoadingScreen from '../../../components/LoadingScreen';
import { useCart } from '../../../contexts/CartContext';
import ProductImage from '../../../components/ProductImage';
import { formatPrice } from '../../../utils/priceUtils';
import { isProductSoldOut } from '../../../utils/productUtils';

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

    // Check if product is sold out (uses stock-based check or price fallback)
    const checkSoldOut = (product) => {
        return isProductSoldOut(product);
    };

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

                    // Build sizes array dynamically from stock fields or use existing sizes array
                    let sizes = [];
                    if (productData.sizes && Array.isArray(productData.sizes) && productData.sizes.length > 0) {
                        // If sizes array exists in database, use it
                        sizes = productData.sizes;
                    } else {
                        // Build sizes from stock fields - check if size names exist, otherwise use defaults
                        // Build all sizes in order to maintain index mapping with stock fields
                        const defaultSizeNames = ['S', 'M', 'L'];
                        const sizeNames = [
                            productData.size1 || defaultSizeNames[0],
                            productData.size2 || defaultSizeNames[1],
                            productData.size3 || defaultSizeNames[2],
                        ];
                        
                        // Build sizes array in order (index 0 = stock1, index 1 = stock2, index 2 = stock3)
                        // Include all sizes that have stock fields defined, even if stock is 0
                        // The getAvailableSizes function will filter out sizes with 0 stock
                        if (productData.stock1 !== undefined) sizes.push(sizeNames[0]);
                        if (productData.stock2 !== undefined) sizes.push(sizeNames[1]);
                        if (productData.stock3 !== undefined) sizes.push(sizeNames[2]);
                    }

                    setProduct({
                        title: productData.name,
                        price: productData.price,
                        shortDescription: productData.description,
                        fullDescription: productData.technicalDescription,
                        color: productData.color,
                        material: productData.material,
                        sizes: sizes,
                        sizeGuideImage: productData.sizeGuideImage || '/placeholders/size-guide.webp',
                        mainImage: productData.images?.[0],
                        collection: productData.collection,
                        category: productData.category || "", // load category
                        stock1: productData.stock1, // load stock for size 1
                        stock2: productData.stock2, // load stock for size 2
                        stock3: productData.stock3, // load stock for size 3
                        video: productData.video || null, // load video
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

    // Filter sizes based on available stock
    // Note: If sizes were built dynamically from stock fields, they already only include sizes with stock > 0
    const getAvailableSizes = () => {
        if (!product || !product.sizes || product.sizes.length === 0) return [];
        
        const stock1 = Number(product.stock1) || 0;
        const stock2 = Number(product.stock2) || 0;
        const stock3 = Number(product.stock3) || 0;
        
        // Check if we have stock fields defined
        const hasStockFields = product.stock1 !== undefined || product.stock2 !== undefined || product.stock3 !== undefined;
        
        if (hasStockFields) {
            // Filter sizes based on stock - map each size to its corresponding stock field
            return product.sizes.filter((size, index) => {
                // Map index to stock field (0 -> stock1, 1 -> stock2, 2 -> stock3)
                if (index === 0) return stock1 > 0;
                if (index === 1) return stock2 > 0;
                if (index === 2) return stock3 > 0;
                // For sizes beyond index 2, show them (assuming they don't have stock tracking)
                return true;
            });
        }
        
        // If no stock fields, return all sizes (legacy products without stock tracking)
        return product.sizes;
    };

    const availableSizes = product ? getAvailableSizes() : [];

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
                        {product.video && (
                            <div className={styles.productVideo}>
                                <video
                                    src={product.video}
                                    controls
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain'
                                    }}
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        )}
                    </div>
                    <div className={styles.productInfo}>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.5rem' }}>
                            <p className={styles.productName} style={{ marginBottom: '7px', transform: 'NONE' }}>{product.category}</p>
                            <p className={styles.productName}>{product.title}</p>
                            <p className={styles.productPrice}>
                                {checkSoldOut(product) ? "SOLD OUT" : `$ ${formatPrice(product.price)}`}
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

                        {availableSizes && availableSizes.length > 0 && !checkSoldOut(product) && (
                            <div className={styles.sizeSelector}>
                                <div className={styles.productShortDescription}>
                                    ELEGÍ EL TALLE:
                                </div>
                                <div className={styles.sizeOptions}>
                                    {availableSizes.map(size => (
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
                            {!checkSoldOut(product) && (
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
