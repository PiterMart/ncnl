// services/productService.js
import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
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

    async addProduct(product) {
        const data = { ...product, createdAt: serverTimestamp() };
        const docRef = await addDoc(this.productsRef, data);
        return docRef.id;
    }

    subscribeToProducts(onUpdate, onError) {
        // ordena por createdAt para ver siempre primero los más recientes
        const q = query(this.productsRef, orderBy("createdAt", "desc"));
        return onSnapshot(
            q,
            (snap) =>
                onUpdate(
                    snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
                ),
            onError
        );
    }
}

export const productService = new ProductService();
