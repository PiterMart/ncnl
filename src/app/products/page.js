// src/app/admin/products/page.js
"use client";

import { useState, useEffect } from "react";
import ProductsTable from "../../../components/ProductsTable";
import { productService } from "../../../services/productService";
import styles from "../../../styles/ProductsPage.module.css";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        // Subscribe to real-time product updates
        const unsubscribe = productService.subscribeToProducts(
            setProducts,
            (err) => {
                console.error("Error suscribiéndose a productos:", err);
                setError("Error al cargar productos en tiempo real.");
            }
        );
        return () => unsubscribe();
    }, []);

    return (
        <div className={styles.pageContainer}>
            <h1 className={styles.title}>Administrar productos</h1>
            {error && <p className={styles.errorText}>{error}</p>}
            <ProductsTable products={products} />
        </div>
    );
}
