"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from "../../firebase/firebaseConfig"; // Make sure this path is correct
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query } from "firebase/firestore";
import ProductsTable from '../../components/ProductsTable'; // Make sure this path is correct
import OrdersTable from '../../components/OrdersTable'; // Make sure this path is correct
import styles from '../../styles/AdminDashboard.module.css'; // Make sure this path is correct

export default function AdminDashboard() {
    // Data states
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // UI states
    const [selectedTab, setSelectedTab] = useState('orders');
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push('/login');
                return;
            }
            try {
                const [productsSnap, ordersSnap] = await Promise.all([
                    getDocs(query(collection(db, "products"))),
                    getDocs(query(collection(db, "orders"))),
                ]);

                setProducts(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setOrders(ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                setLoading(false);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Error al cargar los datos");
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [router]);


    if (loading) return <div className={styles.loading}>Cargando...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Panel de Administración</h1>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${selectedTab === 'orders' ? styles.active : ''}`}
                        onClick={() => setSelectedTab('orders')}
                    >
                        Orders
                    </button>
                    <button
                        className={`${styles.tab} ${selectedTab === 'products' ? styles.active : ''}`}
                        onClick={() => setSelectedTab('products')}
                    >
                        Productos
                    </button>
                </div>
            </div>

            <div className={styles.content}>
                {selectedTab === 'orders' && <OrdersTable orders={orders} />}
                {selectedTab === 'products' && <ProductsTable products={products} />}
            </div>
        </div>
    );
}