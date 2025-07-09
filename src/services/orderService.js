// src/services/orderService.js
import {
    collection,
    addDoc,
    serverTimestamp,
    onSnapshot,
    query,
    orderBy,
    deleteDoc,
    doc,
    updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export class OrderService {
    constructor() {
        this.db = db;
        this.ordersRef = collection(this.db, "orders");
    }

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

    async updateOrderStatus(orderId, status) {
        try {
            const orderDocRef = doc(this.db, "orders", orderId);
            await updateDoc(orderDocRef, {
                status,
                updatedAt: serverTimestamp(), // track change
            });
            console.debug("Order status updated:", orderId, status);
        } catch (error) {
            console.error("Error updating order status:", error);
            throw new Error("No se pudo actualizar el estado de la orden.");
        }
    }

    subscribeToOrders(onNext, onError) {
        const q = query(this.ordersRef, orderBy("createdAt", "desc"));
        return onSnapshot(q, onNext, onError);
    }

    async deleteOrder(orderId) {
        const orderDocRef = doc(this.db, "orders", orderId);
        await deleteDoc(orderDocRef);
    }
}

export const orderService = new OrderService();
