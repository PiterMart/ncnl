"use client";

import { useCart } from "../contexts/CartContext";
import { useRouter } from "next/navigation"; // import router hook
import styles from "../styles/CartList.module.css";

export default function CartList() {
    const { items, removeItem, clearCart } = useCart();
    const router = useRouter(); // initialize router

    // Calculate total
    const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    // If cart is empty, show message and a back-to-shop button
    if (items.length === 0) {
        return (
            <div className={styles.container}>
                <p>Your cart is empty.</p>
                <button
                    className={styles.button}
                    onClick={() => router.push("/shop")}
                >
                    Back to Shop
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h2>Your Cart</h2>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Subtotal</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={item.id}>
                            <td>{item.name}</td>
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

            {/* Clear cart button */}
            <button
                className={styles.button}
                onClick={clearCart}
            >
                Vaciar carrito
            </button>

            {/* Back to shop button */}
            <button
                className={styles.button}
                onClick={() => router.push("/shop")}
                style={{ marginTop: "12px" }} // small inline tweak for spacing
            >
                Volver al Shop
            </button>
        </div>
    );
}
