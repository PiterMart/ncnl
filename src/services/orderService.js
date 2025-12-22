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
import { productService } from "./productService";

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

    /**
     * Update stock for all items in an order after successful payment.
     * @param {Array} items - Array of order items with id, size, and quantity
     * @returns {Promise<void>}
     */
    async updateStockForOrder(items) {
        try {
            for (const item of items) {
                if (!item.id || !item.size || !item.quantity) {
                    console.warn("Skipping item with missing data:", item);
                    continue;
                }

                // Get the product to find the size index
                const product = await productService.getProduct(item.id);
                if (!product) {
                    console.warn(`Product ${item.id} not found, skipping stock update`);
                    continue;
                }

                // Check if product has stock fields
                if (product.stock1 === undefined && product.stock2 === undefined && product.stock3 === undefined) {
                    console.warn(`Product ${item.id} has no stock fields, skipping stock update`);
                    continue;
                }

                // Find the index of the size in the product.sizes array
                if (!product.sizes || !Array.isArray(product.sizes)) {
                    console.warn(`Product ${item.id} has no sizes array, skipping stock update`);
                    continue;
                }

                const sizeIndex = product.sizes.indexOf(item.size);
                if (sizeIndex === -1) {
                    console.warn(`Size ${item.size} not found in product ${item.id} sizes, skipping stock update`);
                    continue;
                }

                // Only update stock for sizes 0, 1, 2 (stock1, stock2, stock3)
                if (sizeIndex >= 0 && sizeIndex <= 2) {
                    await productService.updateProductStock(item.id, sizeIndex, item.quantity);
                } else {
                    console.warn(`Size index ${sizeIndex} is out of range for stock tracking (0-2), skipping stock update`);
                }
            }
            console.debug("Stock updated successfully for all order items");
        } catch (error) {
            console.error("Error updating stock for order:", error);
            throw new Error("No se pudo actualizar el stock de los productos.");
        }
    }
}

export const orderService = new OrderService();
