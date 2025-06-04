// src/app/shop/page.js

"use client";

import { useState } from 'react';
import ProductsGrid from "@/components/ProductsGrid";
import LoadingScreen from "@/components/LoadingScreen";
import styles from "../../styles/ShopPage.module.css";

export default function ShopPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [productsLoaded, setProductsLoaded] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");

    const handleLoadingComplete = () => {
        if (productsLoaded) {
            setIsLoading(false);
        }
    };

    const categories = [
        { value: "", label: "Todas las categorías" },
        { value: "Campera", label: "Campera" },
        { value: "Buzo", label: "Buzo" },
        { value: "Remera", label: "Remera" },
        { value: "Pantalon", label: "Pantalón" },
        { value: "Chaleco", label: "Chaleco" },
        { value: "Camisa", label: "Camisa" },
        { value: "Gorra", label: "Gorra" },
        { value: "Botas", label: "Botas" },
        { value: "Morral", label: "Morral" },
    ];

    return (
        <main className={styles.container}>
            {isLoading && <LoadingScreen onLoadingComplete={handleLoadingComplete} isLoading={!productsLoaded} />}
            
            <div style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.5s ease', width: '100%', height: '100%', margin: '0', padding: '0' }}>
                <div className={styles.filterContainer}>
                    <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className={styles.categoryFilter}
                    >
                        {categories.map(category => (
                            <option key={category.value} value={category.value}>
                                {category.label}
                            </option>
                        ))}
                    </select>
                </div>
                <ProductsGrid 
                    onProductsLoaded={() => setProductsLoaded(true)} 
                    selectedCategory={selectedCategory}
                />
            </div>
        </main>
    );
}
