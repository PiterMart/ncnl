// src/app/shop/page.js

"use client";

import { useState } from 'react';
import ProductsGrid from "@/components/ProductsGrid";
import LoadingScreen from "@/components/LoadingScreen";
import styles from "../../styles/ShopPage.module.css";

export default function ShopPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [productsLoaded, setProductsLoaded] = useState(false);

    const handleLoadingComplete = () => {
        if (productsLoaded) {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.container}>
            {isLoading && <LoadingScreen onLoadingComplete={handleLoadingComplete} isLoading={!productsLoaded} />}
            
            <div style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.5s ease', width: '100%', height: '100%', margin: '0', padding: '0' }}>
                <ProductsGrid onProductsLoaded={() => setProductsLoaded(true)} />
            </div>
        </main>
    );
}
