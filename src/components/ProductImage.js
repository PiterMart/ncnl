"use client";

import { useState } from "react";
import styles from "../styles/ProductsGrid.module.css";

// Reusable Image component with loading state
export default function ProductImage({ 
    src, 
    alt, 
    className, 
    onLoad, 
    onError, 
    style,
    fill = false,
    sizes,
    priority = false,
    quality = 100,
    objectFit = 'cover',
    useContainer = true
}) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = () => {
        setIsLoading(false);
        onLoad?.();
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
        onError?.();
    };

    // If useContainer is false, render without the container wrapper
    if (!useContainer) {
        return (
            <>
                {/* Loading skeleton - only show for the first image */}
                {isLoading && !style?.position && (
                    <div className={styles.imageSkeleton}>
                        <div className={styles.skeletonAnimation}></div>
                    </div>
                )}
                
                {/* Actual image */}
                {!hasError && (
                    <img
                        src={src}
                        alt={alt}
                        className={`${className} ${isLoading ? styles.imageHidden : ''}`}
                        onLoad={handleLoad}
                        onError={handleError}
                        style={{
                            ...style,
                            objectFit: objectFit
                        }}
                    />
                )}
                
                {/* Error fallback - only show for the first image */}
                {hasError && !style?.position && (
                    <div className={styles.imageError}>
                        <span>Error loading image</span>
                    </div>
                )}
            </>
        );
    }

    // Default behavior with container
    return (
        <div className={styles.imageContainer} style={fill ? { position: 'relative' } : {}}>
            {/* Loading skeleton - only show for the first image */}
            {isLoading && !style?.position && (
                <div className={styles.imageSkeleton}>
                    <div className={styles.skeletonAnimation}></div>
                </div>
            )}
            
            {/* Actual image */}
            {!hasError && (
                <img
                    src={src}
                    alt={alt}
                    className={`${className} ${isLoading ? styles.imageHidden : ''}`}
                    onLoad={handleLoad}
                    onError={handleError}
                    style={{
                        ...style,
                        objectFit: objectFit
                    }}
                />
            )}
            
            {/* Error fallback - only show for the first image */}
            {hasError && !style?.position && (
                <div className={styles.imageError}>
                    <span>Error loading image</span>
                </div>
            )}
        </div>
    );
} 