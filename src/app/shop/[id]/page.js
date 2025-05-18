'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import Image from 'next/image';
import styles from '../../../styles/product.module.css';
import { db } from '../../../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import ExpandableSection from '../../../components/ExpandableSection';
import Display from '@/app/components/Display'; // Assuming this is used elsewhere or needed
import LoadingScreen from '../../../components/LoadingScreen';
import { useCart } from '../../../contexts/CartContext';

// Import Lightbox components and styles
import 'yet-another-react-lightbox/styles.css';
// Import the NextJsImage plugin for rendering Next.js Image components
import Lightbox, { NextJsImage } from 'yet-another-react-lightbox'; 


export default function ProductPage() {
    const [selectedSize, setSelectedSize] = useState(null);
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [contentLoaded, setContentLoaded] = useState(false);
    const [error, setError] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);
    const params = useParams();
    const router = useRouter(); // initialize router
    const { addItem } = useCart(); // extract addItem from context

    // State for Lightbox
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0); // Index of the image to show in lightbox

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
                         // Use actual sizes if available, fallback otherwise (assuming productData has sizes array)
                        sizes: productData.sizes && Array.isArray(productData.sizes) && productData.sizes.length > 0 ? productData.sizes : ['S', 'M', 'L', 'XL'],
                        sizeGuideImage: productData.sizeGuideImage || '/placeholders/size-guide.webp', // Use actual guide image if available
                        mainImage: productData.images?.[0],
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
    }, [params.id]); // Dependency on params.id

    const [showSizeGuide, setShowSizeGuide] = useState(false);

    /**
     * Handle adding product to cart and navigate to /cart
     * @param {object} product
     */
    const handleAddToCart = (product) => {
        try {
            // Basic validation if size is required (checking if product.sizes exists and is not empty)
            if (product.sizes && product.sizes.length > 0 && !selectedSize) {
                alert('Please select a size.'); // Or use a more sophisticated notification
                return; // Stop if sizes exist but none selected
            }

            // add item to cart with the correct data structure
            addItem({
                id: params.id, // use the product ID from URL params
                name: product.title, // use title instead of name
                price: product.price,
                quantity: 1, // add default quantity
                size: selectedSize, // include the selected size (will be null if not required/selected)
                mainImage: product.mainImage, // include the main image
                collection: product.collection // include the collection
            });
            // navigate to cart page
            router.push("/cart");
        } catch (err) {
            console.error("Error adding product to cart:", err);
        }
    };

    // Prepare slides array for the lightbox
    const slides = galleryImages.map(image => ({ src: image }));


    return (
        <main className={styles.productContainer}>
            {isLoading && <LoadingScreen onLoadingComplete={handleLoadingComplete} isLoading={!contentLoaded} />}

            {!isLoading && error && (
                <div className={styles.errorContainer}>
                    <h2>{error}</h2>
                </div>
            )}

            {!isLoading && !error && product && (
                <div style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.5s ease', width: '100%', height: '100%', margin: '0', padding: '0' }}>
                    <div className={styles.productGallery}>
                        {galleryImages.map((image, index) => (
                            // Add click handler to open lightbox
                            <div
                                key={index}
                                className={styles.productImage}
                                onClick={() => {
                                    setCurrentImageIndex(index);
                                    setLightboxOpen(true);
                                }}
                                style={{ cursor: 'pointer' }} // Add a pointer cursor to indicate clickability
                            >
                                <Image
                                    src={image}
                                    alt={`Product image ${index + 1}`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority={index === 0} // Priority for the first image
                                    quality={100}
                                    style={{ objectFit: 'contain' }}
                                />
                            </div>
                        ))}
                    </div>
                    <div className={styles.productInfo}>
                        <div>
                                                    {/* Title */}
                        <h1 className={styles.productName}>{product.title}</h1>
                        {/* Price */}
                        <p className={styles.productPrice}>${product.price}</p>
                        <p className={styles.productPrice}>{product.collection}</p>

                        </div>
                        {/* Collection & Category */}
                        <div className={styles.productMeta}>
                            <span> {product.collection}</span>
                        </div>

                        <ExpandableSection title="DETALLES" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                             {/* Short Description */}
                             <div className={styles.productShortDescription}>{product.shortDescription}</div>
                             <div className={styles.productShortDescription}>{product.fullDescription}</div>
                             <div className={styles.productShortDescription}>Color: {product.color}</div>
                             <div className={styles.productShortDescription}>Material: {product.material}</div>
                        </ExpandableSection>

                        {/* Only show size selector if product has sizes */}
                        {product.sizes && product.sizes.length > 0 && (
                             <div className={styles.sizeSelector}>
                                 {/* <p style={{fontSize: '0.75rem'}}>Select Size</p> */}
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
                        )}
                        {/* Size Guide Chart Button */}
                        {product.sizeGuideImage && ( // Only show size guide button if image exists
                            <button className={styles.sizeGuideButton} onClick={() => setShowSizeGuide(true)}>
                                Size Guide Chart
                            </button>
                        )}
                        {showSizeGuide && product.sizeGuideImage && ( // Only show modal if button clicked AND image exists
                            <div className={styles.sizeGuideModal} onClick={() => setShowSizeGuide(false)}>
                                <div className={styles.sizeGuideContent} onClick={e => e.stopPropagation()}>
                                    {/* Use Next.js Image in modal */}
                                    <Image src={product.sizeGuideImage} alt="Size Guide" width={400} height={400} style={{objectFit: 'contain'}} />
                                    <button onClick={() => setShowSizeGuide(false)}>Close</button>
                                </div>
                            </div>
                        )}
                        {/* Add to Cart Button */}
                        <div className={styles.actionButtons}>
                            <button
                                onClick={() => handleAddToCart(product)}
                                className={styles.buyButton}
                                // Disable if product has sizes but none is selected
                                disabled={product.sizes && product.sizes.length > 0 && !selectedSize}
                            >
                                AGREGAR A LA BOLSA
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox component - rendered based on state and needs product data */}
            {product && galleryImages.length > 0 && ( // Only render Lightbox if product has data AND images
                 <Lightbox
                     open={lightboxOpen}
                     close={() => setLightboxOpen(false)}
                     slides={slides} // Use the prepared slides array
                     index={currentImageIndex}
                     // Use the NextJsImage plugin to render images with next/image
                     render={{ slide: NextJsImage }}
                 />
            )}
        </main>
    );
}