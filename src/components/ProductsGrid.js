"use client";

import { useState, useEffect } from "react";
import styles from "../styles/ProductsGrid.module.css";
import { productService } from "@/services/productService";
import Link from "next/link";
// Removed: import useEmblaCarousel

export default function ProductsGrid({ onProductsLoaded }) {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState("");
    // Removed: const [emblaRef] = useEmblaCarousel...

    // Effect to subscribe to product data
    useEffect(() => {
        const unsubscribe = productService.subscribeToProducts(
            (snapshot) => {
                setProducts(snapshot);
                onProductsLoaded?.(); // Call onProductsLoaded when data arrives
            },
            (err) => {
                console.error("Error loading products:", err);
                setError("No se pudieron cargar los productos.");
                onProductsLoaded?.(); // Call onProductsLoaded even on error
            }
        );
        return () => unsubscribe();
    }, [onProductsLoaded]); // Dependency on onProductsLoaded

    // handle error state
    if (error) {
        return <p className={styles.errorText}>{error}</p>;
    }
    // handle empty state
    if (products.length === 0) {
        return <p>No hay productos disponibles.</p>;
    }

    return (
        <div className={styles.container}>
            {/* Reverting to a grid layout container */}
            <div className={styles.grid}>
                {products.map((p) => (
                    // Each Link is now a grid item
                    <Link href={`/shop/${p.id}`} key={p.id} className={styles.card}>
                         {/* Keeping the structure within the card */}
                        {p.images?.[0] && (
                             // Image takes full width of its grid cell
                             <img src={p.images[0]} alt={p.name} className={styles.image} />
                        )}
                         {/* Text container if needed, or style text directly */}
                         <div className={styles.textContainer}>
                             <h2 className={styles.name}>{p.name}</h2>
                             <p className={styles.price}>${p.price}</p>
                         </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}