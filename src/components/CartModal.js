'use client';

import React from 'react';
import { useCart } from '../contexts/CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../styles/CartModal.module.css';

export default function CartModal({ isOpen, onClose }) {
    const { items, removeItem, updateQuantity } = useCart();
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
                        items.map((item) => {
                            // Create a unique key for React that includes both id and size
                            const itemKey = item.size ? `${item.id}_${item.size}` : item.id;
                            
                            return (
                                <div key={itemKey} className={styles.cartItem}>
                                    <Link 
                                        href={`/shop/${item.id}`} 
                                        className={styles.itemImageLink}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onClose();
                                        }}
                                    >
                                        <div className={styles.itemImage}>
                                            <Image
                                                src={item.mainImage || '/placeholders/product-placeholder.jpg'}
                                                alt={item.name}
                                                width={80}
                                                height={80}
                                                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                            />
                                        </div>
                                    </Link>
                                    <div className={styles.itemDetails}>
                                        <Link 
                                            href={`/shop/${item.id}`} 
                                            className={styles.itemNameLink}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onClose();
                                            }}
                                        >
                                            <h3>{item.name}</h3>
                                        </Link>
                                        <p>Talle: {item.size}</p>
                                        <div className={styles.quantityControl}>
                                            <button 
                                                className={styles.quantityButton}
                                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), item.size)}
                                            >
                                                −
                                            </button>
                                            <span className={styles.quantityValue}>{item.quantity}</span>
                                            <button 
                                                className={styles.quantityButton}
                                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <p>${item.price}</p>
                                        <button 
                                            className={styles.removeButton}
                                            onClick={() => removeItem({ id: item.id, size: item.size })}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            );
                        })
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
