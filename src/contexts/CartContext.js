// src/contexts/CartContext.js

'use client';

import React, { createContext, useContext, useReducer, useEffect } from "react";

// Actions
const INITIALIZE = "INITIALIZE";
const ADD_ITEM = "ADD_ITEM";
const REMOVE_ITEM = "REMOVE_ITEM";
const CLEAR_CART = "CLEAR_CART";
const UPDATE_ITEM_QUANTITY = "UPDATE_ITEM_QUANTITY";

// Helper function to create a unique key for cart items (id + size)
// This ensures same product in different sizes are treated as separate items
const getItemKey = (id, size) => {
    // Use size if it exists, otherwise just use id (for products without sizes)
    return size ? `${id}_${size}` : id;
};

// Reducer para manejar el estado del carrito
function cartReducer(state, action) {
    switch (action.type) {
        case INITIALIZE:
            return { items: action.payload };
        case ADD_ITEM: {
            const itemKey = getItemKey(action.payload.id, action.payload.size);
            const existing = state.items.find(i => 
                getItemKey(i.id, i.size) === itemKey
            );
            if (existing) {
                // Increase quantity if same product with same size already in cart
                return {
                    items: state.items.map(i =>
                        getItemKey(i.id, i.size) === itemKey
                            ? { ...i, quantity: i.quantity + (action.payload.quantity || 1) }
                            : i
                    )
                };
            }
            // Add new item with quantity 1 (or specified quantity)
            return {
                items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }]
            };
        }
        case REMOVE_ITEM: {
            // action.payload can be either a string (old format: just id) or an object {id, size}
            let itemKeyToRemove;
            if (typeof action.payload === 'string') {
                // Legacy format: just id, remove all items with this id (backward compatibility)
                return {
                    items: state.items.filter(i => i.id !== action.payload)
                };
            } else {
                // New format: {id, size} - remove specific item
                itemKeyToRemove = getItemKey(action.payload.id, action.payload.size);
                return {
                    items: state.items.filter(i => 
                        getItemKey(i.id, i.size) !== itemKeyToRemove
                    )
                };
            }
        }
        case UPDATE_ITEM_QUANTITY: {
            const { id, size, quantity } = action.payload;
            const itemKey = getItemKey(id, size);
            if (quantity <= 0) {
                // Remove item if quantity is 0 or less
                return {
                    items: state.items.filter(i => 
                        getItemKey(i.id, i.size) !== itemKey
                    )
                };
            }
            return {
                items: state.items.map(i =>
                    getItemKey(i.id, i.size) === itemKey ? { ...i, quantity } : i
                )
            };
        }
        case CLEAR_CART:
            return { items: [] };
        default:
            throw new Error(`Unknown action: ${action.type}`);
    }
}

const CartContext = createContext();

// Proveedor de carrito
export function CartProvider({ children }) {
    // console.log('CartProvider rendering'); 
    const [state, dispatch] = useReducer(cartReducer, { items: [] });

    // Cargar carrito desde localStorage al inicio
    useEffect(() => {
        try {
            const data = localStorage.getItem("cart");
            if (data) {
                dispatch({ type: INITIALIZE, payload: JSON.parse(data) });
            }
        } catch (err) {
            console.error("Failed to load cart from storage:", err);
        }
    }, []);

    // Persistir carrito en localStorage cada vez que cambie
    useEffect(() => {
        try {
            localStorage.setItem("cart", JSON.stringify(state.items));
        } catch (err) {
            console.error("Failed to save cart to storage:", err);
        }
    }, [state.items]);

    // Métodos expuestos
    const addItem = product => {
        try {
            dispatch({ type: ADD_ITEM, payload: product });
        } catch (err) {
            console.error("Error adding item to cart:", err);
        }
    };

    const removeItem = (productIdOrObject, size = null) => {
        try {
            // Support both old format (just id string) and new format (object with id and size)
            if (typeof productIdOrObject === 'string') {
                dispatch({ type: REMOVE_ITEM, payload: productIdOrObject });
            } else {
                // New format: object with id and size
                dispatch({ type: REMOVE_ITEM, payload: productIdOrObject });
            }
        } catch (err) {
            console.error("Error removing item from cart:", err);
        }
    };

    const clearCart = () => {
        try {
            dispatch({ type: CLEAR_CART });
        } catch (err) {
            console.error("Error clearing cart:", err);
        }
    };

    const updateQuantity = (productId, quantity, size = null) => {
        try {
            dispatch({ type: UPDATE_ITEM_QUANTITY, payload: { id: productId, size, quantity } });
        } catch (err) {
            console.error("Error updating item quantity:", err);
        }
    };

    const value = {
        items: state.items,
        addItem,
        removeItem,
        clearCart,
        updateQuantity
    };

    // console.log('CartProvider value:', value); 

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

// Hook para usar el carrito
export function useCart() {
    const context = useContext(CartContext);
    if (!context) {     
        console.error('useCart was called outside of CartProvider'); // Debug log
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
