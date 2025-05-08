// src/services/productService.js
// Encapsulates Firestore operations for products

import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
    updateDoc,
    doc,
    query,
    orderBy,
    onSnapshot,
} from "firebase/firestore";
import { firebaseApp } from "../firebase/firebaseConfig";

class ProductService {
    constructor() {
        this.db = getFirestore(firebaseApp);
        this.productsRef = collection(this.db, "products");
    }

    /** Add a new product document (without images) */
    async addProduct(product) {
        const data = { ...product, createdAt: serverTimestamp(), images: [] };
        const docRef = await addDoc(this.productsRef, data);
        return docRef.id;
    }

    /** Update the images field of a product */
    async updateProductImages(productId, imageUrls) {
        const docRef = doc(this.db, "products", productId);
        await updateDoc(docRef, { images: imageUrls });
    }

    /**
     * Subscribe to real-time updates of products collection,
     * ordered by newest first.
     * @param {Function} onUpdate
     * @param {Function} onError
     * @returns {Function} unsubscribe
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
