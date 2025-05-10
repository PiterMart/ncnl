"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // import router hook
import styles from "../styles/ProductsGrid.module.css";
import { productService } from "@/services/productService";
import { useCart } from "../contexts/CartContext"; // adjust path if needed

export default function ProductsGrid() {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState("");
    const { addItem } = useCart(); // extract addItem from context
    const router = useRouter();    // initialize router

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

    // handle error state
    if (error) {
        return <p className={styles.errorText}>{error}</p>;
    }
    // handle empty state
    if (products.length === 0) {
        return <p>No hay productos disponibles.</p>;
    }

    /**
     * Handle adding product to cart and navigate to /cart
     * @param {object} product
     */
    const handleAddToCart = (product) => {
        try {
            // add item to cart
            addItem({ id: product.id, name: product.name, price: product.price });
            // navigate to cart page
            router.push("/cart");
        } catch (err) {
            console.error("Error adding product to cart:", err);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.grid}>
                {products.map((p) => (
                    <div key={p.id} className={styles.card}>
                        {p.images?.[0] && (
                            <img src={p.images[0]} alt={p.name} className={styles.image} />
                        )}
                        <h2 className={styles.name}>{p.name}</h2>
                        <p className={styles.price}>${p.price}</p>
                        <p className={styles.description}>{p.technicalDescription}</p>
                        <button
                            className={styles.button}
                            onClick={() => handleAddToCart(p)} // call handler
                        >
                            Agregar al carro de compras
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
