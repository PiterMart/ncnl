// src/services/productService.js
// Encapsulates Firestore operations for products

import {
    // getFirestore, // No longer needed here if using the imported db directly
    collection,
    addDoc,
    serverTimestamp,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    onSnapshot,
    getDoc,
    increment,
} from "firebase/firestore";
// Import db directly from your Firebase configuration
import { db } from "../firebase/firebaseConfig"; // Changed import

class ProductService {
    constructor() {
        this.db = db; // Use the imported db instance
        this.productsRef = collection(this.db, "products");
    }

    /** Add a new product document (without images or video) */
    async addProduct(product) {
        const data = { ...product, createdAt: serverTimestamp(), images: [], video: null };
        const docRef = await addDoc(this.productsRef, data);
        return docRef.id;
    }

    /** Update product fields (excluding images) */
    async updateProduct(productId, productData) {
        const docRef = doc(this.db, "products", productId);
        await updateDoc(docRef, { ...productData });
    }

    /** Update the images field of a product */
    async updateProductImages(productId, imageUrls) {
        const docRef = doc(this.db, "products", productId);
        await updateDoc(docRef, { images: imageUrls });
    }

    /** Update the video field of a product */
    async updateProductVideo(productId, videoUrl) {
        const docRef = doc(this.db, "products", productId);
        await updateDoc(docRef, { video: videoUrl });
    }

    /** Delete a product document */
    async deleteProduct(productId) {
        const docRef = doc(this.db, "products", productId);
        await deleteDoc(docRef);
    }

    /** Get a single product by ID */
    async getProduct(productId) {
        try {
            const productRef = doc(this.db, "products", productId);
            const productSnap = await getDoc(productRef);
            if (productSnap.exists()) {
                return { id: productSnap.id, ...productSnap.data() };
            }
            return null;
        } catch (error) {
            console.error("Error getting product:", error);
            throw new Error("No se pudo obtener el producto.");
        }
    }

    /**
     * Update product stock for a specific size index.
     * Uses Firestore increment() for atomic updates without transactions.
     * @param {string} productId - The product ID
     * @param {number} sizeIndex - The index of the size (0 -> stock1, 1 -> stock2, 2 -> stock3)
     * @param {number} quantity - The quantity to subtract (should be positive)
     * @returns {Promise<void>}
     */
    async updateProductStock(productId, sizeIndex, quantity) {
        try {
            const productRef = doc(this.db, "products", productId);
            const stockField = `stock${sizeIndex + 1}`; // stock1, stock2, or stock3
            
            // Use increment() for atomic update - simpler and works with concurrent admin updates
            // Note: This can go negative, but that's acceptable since stock is checked before payment
            await updateDoc(productRef, {
                [stockField]: increment(-quantity)
            });

            console.debug(`Stock updated for product ${productId}, size index ${sizeIndex}, quantity ${quantity}`);
        } catch (error) {
            console.error("Error updating product stock:", error);
            throw new Error(`No se pudo actualizar el stock del producto ${productId}.`);
        }
    }

    /**
     * Subscribe to real-time updates of products collection,
     * ordered by newest first.
     */
    subscribeToProducts(onUpdate, onError) {
        const q = query(this.productsRef, orderBy("createdAt", "desc"));
        return onSnapshot(
            q,
            (snap) =>
                onUpdate(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))),
            onError
        );
    }
}

export const productService = new ProductService();