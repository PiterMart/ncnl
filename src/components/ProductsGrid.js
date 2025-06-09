// src/components/ProductsGrid.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../styles/ProductsGrid.module.css";
import { productService } from "@/services/productService";

/**
 * Formats a numeric value into a string with thousands separators (.)
 * and decimal comma (,) according to es-AR locale.
 * @param {string|number} value - The price to format.
 * @returns {string} - Formatted price string.
 */
function formatPrice(value) {
    try {
        const number = Number(value);
        if (isNaN(number)) {
            throw new Error(`Invalid price value: ${value}`);
        }
        return new Intl.NumberFormat('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(number);
    } catch (error) {
        console.error('Error formatting price:', error);
        // Fallback to raw value
        return String(value);
    }
}

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

    const filteredProducts = selectedCategory
        ? products.filter(p => p.category === selectedCategory)
        : [...products].sort((a, b) => {
            if (a.category === "Campera" && b.category !== "Campera") return -1;
            if (a.category !== "Campera" && b.category === "Campera") return 1;
            return 0;
        });

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
                        {p.images?.[0] && (
                            <div className={styles.imageContainer}>
                                <img
                                    src={p.images[0]}
                                    alt={p.name}
                                    className={styles.image}
                                    style={{
                                        opacity: hoveredProduct === p.id ? 0 : 1,
                                        transition: 'opacity 0.3s ease-in-out'
                                    }}
                                />
                                {p.images[1] && (
                                    <img
                                        src={p.images[1]}
                                        alt={p.name}
                                        className={styles.image}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            opacity: hoveredProduct === p.id ? 1 : 0,
                                            transition: 'opacity 0.3s ease-in-out'
                                        }}
                                    />
                                )}
                            </div>
                        )}
                        <div className={styles.textContainer}>
                            <p className={styles.name} style={{ marginBottom: '-1px', transform: 'none' }}>{p.category}</p>
                            <h2 className={styles.name}>{p.name}</h2>
                            {/* Apply localized formatting */}
                            <p className={styles.price}>
                                ${formatPrice(p.price)}
                            </p>
                        </div>
                    </Link> 
                ))}
            </div>
        </div>
    );
}
