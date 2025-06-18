// src/services/orderService.js

import {
    // getFirestore, // No longer needed here if using the imported db directly
    collection,
    addDoc,
    serverTimestamp,
    onSnapshot,
    query,
    orderBy,
    deleteDoc,
    doc
} from "firebase/firestore";
// Import db directly from your Firebase configuration
import { db } from "../firebase/firebaseConfig"; // Changed import

export class OrderService {
    constructor() {
        this.db = db; // Use the imported db instance
        this.ordersRef = collection(this.db, "orders");
    }

    /**
     * Add a new order document to Firestore
     * @param {Object} orderData - payload with customer, items and total
     * @returns {Promise<string>} - the new order document ID
     */
    async addOrder(orderData) {
        try {
            const data = {
                ...orderData,
                createdAt: serverTimestamp(),
            };
            const docRef = await addDoc(this.ordersRef, data);
            console.debug("Order document written with ID:", docRef.id);
            return docRef.id;
        } catch (error) {
            console.error("Error adding order to Firestore:", error);
            throw new Error("No se pudo guardar la orden en Firestore.");
        }
    }

    /**
     * Subscribe in real time to the 'orders' collection
     * @param {Function} onNext - callback with a QuerySnapshot
     * @param {Function} onError - error callback
     * @returns {Function} unsubscribe function
     */
    subscribeToOrders(onNext, onError) {
        const q = query(this.ordersRef, orderBy("createdAt", "desc"));
        return onSnapshot(q, onNext, onError);
    }

    /**
     * Delete an order document from Firestore
     * @param {string} orderId - ID of the order to delete
     * @returns {Promise<void>}
     */
    async deleteOrder(orderId) {
        const orderDocRef = doc(this.db, "orders", orderId);
        await deleteDoc(orderDocRef);
    }
}

export const orderService = new OrderService();