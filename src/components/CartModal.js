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
                    {/* <p>Guardado</p> */}
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <div className={styles.cartItems}>
                    {items.length === 0 ? (
                        <p className={styles.emptyCart}>VACÍO</p>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className={styles.cartItem}>
                                <div className={styles.itemDetails}>
                                    <Image
                                        src={item.mainImage || '/placeholders/product-placeholder.jpg'}
                                        alt={item.name}
                                        width={300}
                                        height={300}
                                        style={{ objectFit: 'cover' }}
                                    />
                                    <h3>{item.name}</h3>
                                    <p>Talle: {item.size}</p>
                                    <p>Cantidad: {item.quantity}</p>
                                    <p>${item.price}</p>
                                    <button 
                                        className={styles.removeButton}
                                        onClick={() => removeItem(item.id)}
                                    >
                                        ×
                                    </button>
                                </div>
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
                            BOLSA
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
