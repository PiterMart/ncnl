// src/services/orderService.js

import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
    onSnapshot,
    query,
    orderBy,
    deleteDoc,
    doc
} from "firebase/firestore";
import { firebaseApp } from "../firebase/firebaseConfig";

export class OrderService {
    constructor() {
        this.db = getFirestore(firebaseApp);
        this.ordersRef = collection(this.db, "orders");
    }

    /**
     * Add a new order document to Firestore
     * @param {Object} orderData - payload with customer, items and total
     * @returns {Promise<string>} - the new order document ID
     */
    async addOrder(orderData) {
        const data = {
            ...orderData,
            createdAt: serverTimestamp(),
        };
        const docRef = await addDoc(this.ordersRef, data);
        return docRef.id;
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
        // Get a reference to the specific order document
        const orderDocRef = doc(this.db, "orders", orderId);
        // Delete it
        await deleteDoc(orderDocRef);
    }
}

export const orderService = new OrderService();
