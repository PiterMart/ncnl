"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "../contexts/CartContext";
import { useRouter } from "next/navigation";
import Checkout from "./Checkout";
import LoadingScreen from "./LoadingScreen";
import styles from "../styles/CartList.module.css";
import Link from "next/link";

// Placeholder for MercadoPago related state and function if not from context
const createPreference = async (items) => {
    console.log("Creating preference for items:", items);
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log("MercadoPago preference creation simulated.");
    return "mock-preference-id-123";
};


export default function CartList() {
    const { items, removeItem, clearCart } = useCart();
    const [showCheckout, setShowCheckout] = useState(false);
    const [preferenceId, setPreferenceId] = useState(null);
    const [loadingMp, setLoadingMp] = useState(false);
    const [mpError, setMpError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [contentLoaded, setContentLoaded] = useState(false);
    const [acceptPrivacy, setAcceptPrivacy] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);

    const router = useRouter();

    const handleLoadingComplete = () => {
        setIsLoading(false);
    };

    useEffect(() => {
        async function fetchPreference() {
            setLoadingMp(true);
            setMpError(null);
            try {
                const mpItems = items.map(item => ({
                    title: item.name,
                    quantity: item.quantity,
                    unit_price: parseFloat(item.price) || 0,
                })).filter(item => item.quantity > 0 && item.unit_price >= 0);

                if (mpItems.length > 0) {
                     const id = await createPreference(mpItems);
                     setPreferenceId(id);
                } else {
                    setPreferenceId(null);
                }
                setContentLoaded(true);
            } catch (error) {
                console.error("Error fetching MercadoPago preference:", error);
                setMpError(error.message);
                setContentLoaded(true);
            } finally {
                setLoadingMp(false);
            }
        }

        fetchPreference();
    }, [items]);

    if (showCheckout) {
        return <Checkout preferenceId={preferenceId} onBack={() => setShowCheckout(false)} />;
    }

    return (
        <div className={styles.container}>
            {isLoading && <LoadingScreen onLoadingComplete={handleLoadingComplete} isLoading={!contentLoaded} />}
            
            <div style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.5s ease', width: '100%', height: '100%', margin: '0', padding: ' 1rem' }}>
                {items.length === 0 ? (
                    <div className={styles.emptyCartContainer}>
                        <p className={styles.emptyCart}>Tu carrito está vacío.</p>
                        <button className={styles.button} onClick={() => router.push("/shop")}>
                            SEGUIR COMPRANDO
                        </button>
                    </div>
                ) : (
                    <>
                        <h1 className={styles.cartTitle}>BOLSA</h1>
                        <div className={styles.cartItemsContainer}>
                            {items.map(item => {
                                const itemPrice = parseFloat(item.price) || 0;
                                const itemQuantity = item.quantity || 0;
                                const itemColor = item.color || 0;
                                const itemSubtotal = itemPrice * itemQuantity;

                                if (itemPrice < 0 || itemQuantity < 0) {
                                     console.warn("Skipping rendering of invalid cart item:", item);
                                     return null;
                                }

                                return (
                                    <div key={item.id} className={styles.cartItem}>
                                        {/* Add image if available */}
                                        
                                        {item.mainImage && (
                                            <div className={styles.itemImage}>
                                                {/* Using a standard <img> tag */}
                                                <img src={item.mainImage} alt={item.name} className={styles.itemImageTag} />
                                            </div>
                                        )}
                                        <div className={styles.itemDetails}>
                                            <p className={styles.itemName} style={{ marginBottom: '-7px', transform: 'none' }}>{item.category}</p>
                                            <div className={styles.itemName}>{item.name}</div>
                                            <div className={styles.itemActions}>
                                             <button
                                                className={styles.removeButton}
                                                onClick={() => removeItem(item.id)}
                                            >
                                                X
                                            </button>
                                        </div>
                                            {item.size && <div className={styles.itemSize}>Talle {item.size}</div>}
                                            <div className={styles.itemQuantity}>Cnt {itemQuantity}</div>
                                            <div className={styles.itemQuantity}>{itemColor}</div>
                                            <div className={styles.itemSubtotal}>${itemSubtotal.toFixed(2)}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className={styles.cartSummary}>
                             <div className={styles.total}>Total: ${items.reduce((sum, item) => {
                                const price = parseFloat(item.price) || 0;
                                const quantity = item.quantity || 0;
                                return sum + price * quantity;
                            }, 0).toFixed(2)}</div>

                             {mpError && <div className={styles.error}>{mpError}</div>}

                            <div className={styles.checkboxContainer}>
                                <div className={styles.checkboxItem}>
                                    <input
                                        type="checkbox"
                                        id="privacy"
                                        checked={acceptPrivacy}
                                        onChange={(e) => setAcceptPrivacy(e.target.checked)}
                                        className={styles.checkbox}
                                    />
                                    <label htmlFor="privacy" className={styles.checkboxLabel}>
                                        Acepto la <Link href="/politica-de-privacidad" className={styles.link}>política de privacidad</Link>
                                    </label>
                                </div>
                                <div className={styles.checkboxItem}>
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        checked={acceptTerms}
                                        onChange={(e) => setAcceptTerms(e.target.checked)}
                                        className={styles.checkbox}
                                    />
                                    <label htmlFor="terms" className={styles.checkboxLabel}>
                                        Acepto los <Link href="/terminos-y-condiciones" className={styles.link}>términos y condiciones</Link>
                                    </label>
                                </div>
                            </div>

                            <button
                                style={{fontSize: '1.5rem', fontWeight: '600'}}
                                className={styles.button}
                                onClick={() => setShowCheckout(true)}
                                disabled={!preferenceId || loadingMp || items.length === 0 || !acceptPrivacy || !acceptTerms}
                            >
                                {loadingMp ? 'CARGANDO...' : 'FINALIZAR COMPRA'}
                            </button>
                            <button className={styles.shopButton} onClick={() => router.push("/shop")}>
                                SEGUIR COMPRANDO
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}