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
} from "firebase/firestore";
// Import db directly from your Firebase configuration
import { db } from "../firebase/firebaseConfig"; // Changed import

class ProductService {
    constructor() {
        this.db = db; // Use the imported db instance
        this.productsRef = collection(this.db, "products");
    }

    /** Add a new product document (without images) */
    async addProduct(product) {
        const data = { ...product, createdAt: serverTimestamp(), images: [] };
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

    /** Delete a product document */
    async deleteProduct(productId) {
        const docRef = doc(this.db, "products", productId);
        await deleteDoc(docRef);
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