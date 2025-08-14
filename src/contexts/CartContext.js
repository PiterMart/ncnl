// src/contexts/CartContext.js

'use client';

import React, { createContext, useContext, useReducer, useEffect } from "react";

// Actions
const INITIALIZE = "INITIALIZE";
const ADD_ITEM = "ADD_ITEM";
const REMOVE_ITEM = "REMOVE_ITEM";
const CLEAR_CART = "CLEAR_CART";

// Reducer para manejar el estado del carrito
function cartReducer(state, action) {
    switch (action.type) {
        case INITIALIZE:
            return { items: action.payload };
        case ADD_ITEM: {
            const existing = state.items.find(i => i.id === action.payload.id);
            if (existing) {
                // Increase quantity if item already in cart
                return {
                    items: state.items.map(i =>
                        i.id === action.payload.id
                            ? { ...i, quantity: i.quantity + 1 }
                            : i
                    )
                };
            }
            // Add new item with quantity 1
            return {
                items: [...state.items, { ...action.payload, quantity: 1 }]
            };
        }
        case REMOVE_ITEM:
            // Remove completely
            return {
                items: state.items.filter(i => i.id !== action.payload)
            };
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

    const removeItem = productId => {
        try {
            dispatch({ type: REMOVE_ITEM, payload: productId });
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

    const value = {
        items: state.items,
        addItem,
        removeItem,
        clearCart
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
