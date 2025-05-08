// src/components/ProductsGrid.js
"use client";

import { useState, useEffect } from "react";
import styles from "../../styles/ProductsGrid.module.css";
import { productService } from "../../services/productService";

/**
 * Client component: subscribes to Firestore and renders a grid
 */
export default function ProductsGrid() {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const unsubscribe = productService.subscribeToProducts(
            (snapshot) => setProducts(snapshot),
            (err) => {
                console.error("Error loading products:", err);
                setError("No se pudieron cargar los productos.");
            }
        );
        return () => unsubscribe();
    }, []);

    if (error) {
        return <p className={styles.errorText}>{error}</p>;
    }
    if (products.length === 0) {
        return <p>No hay productos disponibles.</p>;
    }

    return (
        <div className={styles.grid}>
            {products.map((p) => (
                <div key={p.id} className={styles.card}>
                    {p.images?.[0] && (
                        <img src={p.images[0]} alt={p.name} className={styles.image} />
                    )}
                    <h2 className={styles.name}>{p.name}</h2>
                    <p className={styles.price}>${p.price}</p>
                    <p className={styles.description}>{p.technicalDescription}</p>
                    <button className={styles.button}>Agregar al carrito</button>
                </div>
            ))}
        </div>
    );
}
