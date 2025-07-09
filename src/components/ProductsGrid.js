// src/components/ProductsGrid.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../styles/ProductsGrid.module.css";
import { productService } from "@/services/productService";
import ProductImage from "./ProductImage";
import { formatPrice } from "../utils/priceUtils";

export default function ProductsGrid({ onProductsLoaded }) {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [hoveredProduct, setHoveredProduct] = useState(null);

    useEffect(() => {
        // Subscribe to product updates
        const unsubscribe = productService.subscribeToProducts(
            (snapshot) => {
                setProducts(snapshot);
                onProductsLoaded?.(); // Notify parent when data arrives
            },
            (err) => {
                console.error("Error loading products:", err);
                setError("No se pudieron cargar los productos.");
                onProductsLoaded?.(); // Notify parent even on error
            }
        );
        return () => unsubscribe();
    }, [onProductsLoaded]);

    const categories = [
        "Campera", "Buzo", "Remera", "Pantalon", "Chaleco", 
        "Camisa", "Gorra", "Botas", "Morral"
    ];

    // Custom sorting function for products
    const sortProducts = (products) => {
        const priorityOrder = [
            "LA BESTIA",
            "SANTO NEGRO", 
            "EL SILENCIO",
            "PASTOR TECH"
        ];

        // Debug: Log all campera products to see their actual names
        console.log("All campera products:", products.filter(p => p.category === "Campera").map(p => p.name));

        return [...products].sort((a, b) => {
            // First, prioritize camperas
            const aIsCampera = a.category === "Campera";
            const bIsCampera = b.category === "Campera";
            
            if (aIsCampera && !bIsCampera) return -1;
            if (!aIsCampera && bIsCampera) return 1;
            
            // If both are camperas, sort by priority order
            if (aIsCampera && bIsCampera) {
                // Try exact match first
                let aIndex = priorityOrder.indexOf(a.name);
                let bIndex = priorityOrder.indexOf(b.name);
                
                // If exact match fails, try partial match (case insensitive)
                if (aIndex === -1) {
                    aIndex = priorityOrder.findIndex(priority => 
                        a.name.toLowerCase().includes(priority.toLowerCase())
                    );
                }
                if (bIndex === -1) {
                    bIndex = priorityOrder.findIndex(priority => 
                        b.name.toLowerCase().includes(priority.toLowerCase())
                    );
                }
                
                // If both are in priority order, sort by their position
                if (aIndex !== -1 && bIndex !== -1) {
                    return aIndex - bIndex;
                }
                
                // If only one is in priority order, prioritize it
                if (aIndex !== -1 && bIndex === -1) return -1;
                if (aIndex === -1 && bIndex !== -1) return 1;
                
                // If neither is in priority order, sort alphabetically
                return a.name.localeCompare(b.name);
            }
            
            // For non-camperas, sort alphabetically by name
            return a.name.localeCompare(b.name);
        });
    };

    const filteredProducts = selectedCategory
        ? products.filter(p => p.category === selectedCategory)
        : sortProducts(products);

    // Debug: Log the final sorted order
    console.log("Final sorted products:", filteredProducts.map(p => `${p.name} (${p.category})`));

    if (error) {
        return <p className={styles.errorText}>{error}</p>;
    }

    if (products.length === 0) {
        return <p>No hay productos disponibles.</p>;
    }

    return (
        <div className={styles.container}>
            {/* <div className={styles.filterContainer}>
                <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={styles.categoryFilter}
                >
                    <option value="">Todas las categorías</option>
                    {categories.map(category => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div> */}
            <div className={styles.grid}>
                {filteredProducts.map((p) => (
                    <Link
                        href={`/shop/${p.id}`}
                        key={p.id}
                        className={styles.card}
                        onMouseEnter={() => setHoveredProduct(p.id)}
                        onMouseLeave={() => setHoveredProduct(null)}
                    >
                        <div className={styles.imageContainer}>
                            {p.images?.[0] && (
                                <ProductImage
                                    src={p.images[0]}
                                    alt={p.name}
                                    className={styles.image}
                                    style={{
                                        opacity: hoveredProduct === p.id ? 0 : 1,
                                        transition: 'opacity 0.3s ease-in-out'
                                    }}
                                />
                            )}
                            {p.images?.[1] && (
                                <ProductImage
                                    src={p.images[1]}
                                    alt={p.name}
                                    className={styles.image}
                                    useContainer={false}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        opacity: hoveredProduct === p.id ? 1 : 0,
                                        transition: 'opacity 0.3s ease-in-out',
                                        zIndex: 1
                                    }}
                                />
                            )}
                        </div>
                        <div className={styles.textContainer}>
                            <p className={styles.name} style={{ top: '-1.5rem', position: 'absolute', transform: 'none' }}>{p.category}</p>
                            <h2 className={styles.name} style={{ top: '-0.25rem', position: 'absolute' }}>{p.name}</h2>
                            {/* Apply localized formatting */}
                            <p className={styles.price} style={{ top: '1.25rem', position: 'absolute' }}>
                                ${formatPrice(p.price)}
                            </p>
                        </div>
                    </Link> 
                ))}
            </div>
        </div>
    );
}
