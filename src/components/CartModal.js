'use client';

import React from 'react';
import { useCart } from '../contexts/CartContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from '../styles/CartModal.module.css';

export default function CartModal({ isOpen, onClose }) {
    const { items, removeItem } = useCart();
    const router = useRouter();

    if (!isOpen) return null;

    // Calculate total amount
    const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Carrito de Compras</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <div className={styles.cartItems}>
                    {items.length === 0 ? (
                        <p className={styles.emptyCart}>Tu carrito está vacío</p>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className={styles.cartItem}>
                                <div className={styles.itemImage}>
                                    <Image
                                        src={item.image || '/placeholders/product-placeholder.jpg'}
                                        alt={item.name}
                                        width={80}
                                        height={80}
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                                <div className={styles.itemDetails}>
                                    <h3>{item.name}</h3>
                                    <p>Talle: {item.size}</p>
                                    <p>Cantidad: {item.quantity}</p>
                                    <p>${item.price}</p>
                                </div>
                                <button 
                                    className={styles.removeButton}
                                    onClick={() => removeItem(item.id)}
                                >
                                    ×
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className={styles.modalFooter}>
                        <p className={styles.total}>Total: ${total.toFixed(2)}</p>
                        <button 
                            className={styles.viewCartButton}
                            onClick={() => {
                                router.push('/cart');
                                onClose();
                            }}
                        >
                            Ver Carrito Completo
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
