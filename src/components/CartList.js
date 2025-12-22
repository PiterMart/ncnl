"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "../contexts/CartContext";
import { useRouter } from "next/navigation";
import Checkout from "./Checkout";
import LoadingScreen from "./LoadingScreen";
import styles from "../styles/CartList.module.css";
import Link from "next/link";
import { formatPrice } from "../utils/priceUtils";
import { db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

// Placeholder for MercadoPago related state and function if not from context
const createPreference = async (items) => {
    console.log("Creating preference for items:", items);
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log("MercadoPago preference creation simulated.");
    return "mock-preference-id-123";
};


export default function CartList() {
    const { items, removeItem, clearCart, updateQuantity } = useCart();
    const [showCheckout, setShowCheckout] = useState(false);
    const [preferenceId, setPreferenceId] = useState(null);
    const [loadingMp, setLoadingMp] = useState(false);
    const [mpError, setMpError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [contentLoaded, setContentLoaded] = useState(false);
    const [acceptPrivacy, setAcceptPrivacy] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [productStocks, setProductStocks] = useState({}); // Store stock data by product ID

    const router = useRouter();

    // Fetch product stock data for cart items
    useEffect(() => {
        const fetchProductStocks = async () => {
            const stockMap = {};
            for (const item of items) {
                if (!item.id) continue;
                
                try {
                    const productRef = doc(db, "products", item.id);
                    const productSnap = await getDoc(productRef);
                    
                    if (productSnap.exists()) {
                        const productData = productSnap.data();
                        
                        // Build sizes array the same way as product page does
                        let sizes = [];
                        if (productData.sizes && Array.isArray(productData.sizes) && productData.sizes.length > 0) {
                            // If sizes array exists in database, use it
                            sizes = productData.sizes;
                        } else {
                            // Build sizes from stock fields - check if size names exist, otherwise use defaults
                            const defaultSizeNames = ['S', 'M', 'L'];
                            const sizeNames = [
                                productData.size1 || defaultSizeNames[0],
                                productData.size2 || defaultSizeNames[1],
                                productData.size3 || defaultSizeNames[2],
                            ];
                            
                            // Build sizes array in order (index 0 = stock1, index 1 = stock2, index 2 = stock3)
                            if (productData.stock1 !== undefined) sizes.push(sizeNames[0]);
                            if (productData.stock2 !== undefined) sizes.push(sizeNames[1]);
                            if (productData.stock3 !== undefined) sizes.push(sizeNames[2]);
                        }
                        
                        stockMap[item.id] = {
                            stock1: productData.stock1 !== undefined ? Number(productData.stock1) || 0 : null,
                            stock2: productData.stock2 !== undefined ? Number(productData.stock2) || 0 : null,
                            stock3: productData.stock3 !== undefined ? Number(productData.stock3) || 0 : null,
                            sizes: sizes
                        };
                        
                        // Debug log to verify sizes array is built correctly
                        if (item.id && sizes.length > 0) {
                            console.log(`Product ${item.id} sizes array:`, sizes, 'stock1:', stockMap[item.id].stock1, 'stock2:', stockMap[item.id].stock2, 'stock3:', stockMap[item.id].stock3);
                        }
                    }
                } catch (error) {
                    console.error(`Error fetching stock for product ${item.id}:`, error);
                }
            }
            setProductStocks(stockMap);
        };

        if (items.length > 0) {
            fetchProductStocks();
        } else {
            setProductStocks({});
        }
    }, [items]);

    // Helper function to get available stock for an item
    const getAvailableStock = (item) => {
        const stockData = productStocks[item.id];
        if (!stockData || !item.size) {
            // No stock data loaded yet or no size selected
            return undefined;
        }

        // Find the size index in the product's sizes array
        const sizeIndex = stockData.sizes.indexOf(item.size);
        if (sizeIndex === -1) {
            // Size not found - log for debugging
            console.warn(`Size "${item.size}" not found in sizes array for product ${item.id}. Available sizes:`, stockData.sizes);
            return undefined;
        }

        // Map index to stock field (0 -> stock1, 1 -> stock2, 2 -> stock3)
        let stock = null;
        if (sizeIndex === 0) {
            stock = stockData.stock1;
        } else if (sizeIndex === 1) {
            stock = stockData.stock2;
        } else if (sizeIndex === 2) {
            stock = stockData.stock3;
        }
        
        // Return the stock value (can be a number >= 0, or null/undefined if no stock tracking)
        if (stock !== null && stock !== undefined) {
            return Number(stock);
        }
        return undefined;
    };

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
                        <h1 className={styles.cartTitle}>BAG</h1>
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

                                // Create a unique key for React that includes both id and size
                                const itemKey = item.size ? `${item.id}_${item.size}` : item.id;

                                return (
                                    <div key={itemKey} className={styles.cartItem}>
                                        {/* Add image if available */}
                                        
                                        {item.mainImage && (
                                            <Link href={`/shop/${item.id}`} className={styles.itemImageLink}>
                                                <div className={styles.itemImage}>
                                                    {/* Using a standard <img> tag */}
                                                    <img src={item.mainImage} alt={item.name} className={styles.itemImageTag} />
                                                </div>
                                            </Link>
                                        )}
                                        <div className={styles.itemDetails}>
                                            <p className={styles.itemName} style={{ marginBottom: '-7px', transform: 'none' }}>{item.category}</p>
                                            <Link href={`/shop/${item.id}`} className={styles.itemNameLink}>
                                                <div className={styles.itemName}>{item.name}</div>
                                            </Link>
                                            <div className={styles.itemActions}>
                                             <button
                                                className={styles.removeButton}
                                                onClick={() => removeItem({ id: item.id, size: item.size })}
                                            >
                                                X
                                            </button>
                                        </div>
                                            {item.size && <div className={styles.itemSize}>Talle {item.size}</div>}
                                            <div className={styles.quantityControl}>
                                                <button 
                                                    className={styles.quantityButton}
                                                    onClick={() => updateQuantity(item.id, Math.max(1, itemQuantity - 1), item.size)}
                                                >
                                                    −
                                                </button>
                                                <span className={styles.quantityValue}>{itemQuantity}</span>
                                                <button 
                                                    className={styles.quantityButton}
                                                    onClick={() => {
                                                        const availableStock = getAvailableStock(item);
                                                        // If stock data exists and we got a valid stock number, limit to it
                                                        if (typeof availableStock === 'number' && availableStock >= 0) {
                                                            // Limit to available stock
                                                            const newQuantity = Math.min(itemQuantity + 1, availableStock);
                                                            if (newQuantity > itemQuantity && newQuantity <= availableStock) {
                                                                updateQuantity(item.id, newQuantity, item.size);
                                                            }
                                                        } else if (availableStock === null) {
                                                            // No stock tracking for this product (no stock fields), allow increment
                                                            updateQuantity(item.id, itemQuantity + 1, item.size);
                                                        }
                                                        // If availableStock is undefined, don't do anything (data not loaded yet or error)
                                                    }}
                                                    disabled={(() => {
                                                        const availableStock = getAvailableStock(item);
                                                        // Disable if we have stock tracking and quantity is at or above the limit
                                                        if (typeof availableStock === 'number' && availableStock >= 0) {
                                                            return itemQuantity >= availableStock;
                                                        }
                                                        // Don't disable if no stock tracking (null) or data not loaded (undefined)
                                                        return false;
                                                    })()}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div className={styles.itemQuantity}>{itemColor}</div>
                                            <div className={styles.itemSubtotal}>${formatPrice(itemSubtotal)}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className={styles.cartSummary}>
                             <div className={styles.total}>Total: ${formatPrice(items.reduce((sum, item) => {
                                const price = parseFloat(item.price) || 0;
                                const quantity = item.quantity || 0;
                                return sum + price * quantity;
                            }, 0))}</div>

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