// src/services/orderService.js
import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
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
}

export const orderService = new OrderService();
