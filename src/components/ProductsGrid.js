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

    if (error) {
        return <p className={styles.errorText}>{error}</p>;
    }

    if (products.length === 0) {
        return <p>No hay productos disponibles.</p>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.grid}>
                {products.map((p) => (
                    <Link
                        href={`/shop/${p.id}`}
                        key={p.id}
                        className={styles.card}
                    >
                        {p.images?.[0] && (
                            <img
                                src={p.images[0]}
                                alt={p.name}
                                className={styles.image}
                            />
                        )}
                        <div className={styles.textContainer}>
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
