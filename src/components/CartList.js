// src/components/CartList.js
"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "../contexts/CartContext";
import { useRouter } from "next/navigation";
import Checkout from "./Checkout";
import styles from "../styles/CartList.module.css";

export default function CartList() {
    const { items, removeItem, clearCart } = useCart();
    const [showCheckout, setShowCheckout] = useState(false);
    const router = useRouter();

    // Fetch preferenceId each time cambian los items
    useEffect(() => {
        async function fetchPreference() {
            setLoadingMp(true);
            setMpError(null);
            try {
                // Map cart items to MercadoPago format
                const mpItems = items.map(item => ({
                    title: item.name,
                    quantity: item.quantity,
                    unit_price: item.price,
                }));
                const id = await createPreference(mpItems);
                setPreferenceId(id);
            } catch (error) {
                console.error(error);
                setMpError(error.message);
            } finally {
                setLoadingMp(false);
            }
        }

        if (items.length > 0) {
            fetchPreference();
        }
    }, [items]);

    // Si el usuario clickeó "Finalizar Compras"
    if (showCheckout) {
        return <Checkout onBack={() => setShowCheckout(false)} />;
    }

    // Carrito vacío
    if (items.length === 0) {
        return (
            <div className={styles.container}>
                <p>Tu carrito está vacío.</p>
                <button className={styles.button} onClick={() => router.push("/shop")}>
                    Volver al Shop
                </button>
            </div>
        );
    }

    // Total
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className={styles.container}>
            <h2>Tu carrito</h2>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Talle</th>
                        <th>Cantidad</th>
                        <th>Precio unitario</th>
                        <th>Subtotal</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>{item.size}</td>
                            <td>{item.quantity}</td>
                            <td>${item.price}</td>
                            <td>${(item.price * item.quantity).toFixed(2)}</td>
                            <td>
                                <button
                                    className={styles.button}
                                    onClick={() => removeItem(item.id)}
                                >
                                    Quitar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p className={styles.total}>Total: ${total.toFixed(2)}</p>
            <button
                className={styles.button}
                onClick={() => setShowCheckout(true)}
                style={{ marginTop: "12px" }}
            >
                Finalizar Compra
            </button>
            <button style={{ marginTop: "12px" }} className={styles.button} onClick={clearCart}>
                Vaciar carrito
            </button>
            <button
                className={styles.button}
                onClick={() => router.push("/shop")}
                style={{ marginTop: "12px" }}
            >
                Volver al Shop
            </button>

        </div>
    );
}
