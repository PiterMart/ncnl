// app/admin/page.js or pages/admin.js
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from "../../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query } from "firebase/firestore";
import LeadsTable from '../../components/LeadsTable';
import ProductsTable from '../../components/ProductsTable';
import OrdersTable from '../../components/OrdersTable'; // Import OrdersTable
import NewsletterForm from '../../components/NewsletterForm';
import styles from '../../styles/AdminDashboard.module.css';

export default function AdminDashboard() {
    // Data states
    const [leads, setLeads] = useState([]);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]); // State for orders
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // UI states
    const [selectedTab, setSelectedTab] = useState('leads');
    const [showNewsletter, setShowNewsletter] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Subscribe to Firebase Auth state
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push('/login');
                return;
            }
            try {
                // Fetch all collections in parallel
                const [leadsSnap, usersSnap, productsSnap, ordersSnap] = await Promise.all([
                    getDocs(query(collection(db, "leads"))),
                    getDocs(query(collection(db, "users"))),
                    getDocs(query(collection(db, "products"))),
                    getDocs(query(collection(db, "orders"))), // Fetch orders
                ]);

                // Map docs to data arrays
                setLeads(leadsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setProducts(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setOrders(ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))); // Set orders

                setLoading(false);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Error al cargar los datos");
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    // Send account creation emails for leads
    const handleSendAccountEmails = async () => {
        try {
            const leadsNoAccount = leads.filter(lead => !lead.hasAccount);
            const leadIds = leadsNoAccount.map(lead => lead.id);

            const response = await fetch('/api/send-account-emails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadIds }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error al enviar los emails');

            // Update local state for leads
            setLeads(leads.map(lead =>
                leadIds.includes(lead.id)
                    ? { ...lead, accountEmailSent: true, status: 'pending' }
                    : lead
            ));

            alert('Emails de creación de cuenta enviados exitosamente');
        } catch (err) {
            console.error('Error sending account emails:', err);
            alert('Error al enviar los emails de creación de cuenta');
        }
    };

    // Send newsletter based on selected tab
    const handleNewsletterSend = async (newsletterData) => {
        try {
            // Determine recipients array according to tab
            let recipients = [];
            switch (selectedTab) {
                case 'leads':
                    recipients = leads.map(r => r.email);
                    break;
                case 'users':
                    recipients = users.map(r => r.email);
                    break;
                case 'products':
                    recipients = products.map(r => r.email);
                    break;
                case 'orders':
                    // orders have customer object with email
                    recipients = orders.map(o => o.customer.email);
                    break;
            }

            await fetch('/api/send-newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newsletterData,
                    recipients,
                    recipientType: selectedTab
                }),
            });

            alert('Newsletter enviado exitosamente');
        } catch (err) {
            console.error('Error sending newsletter:', err);
            alert('Error al enviar el newsletter');
        }
    };

    if (loading) return <div className={styles.loading}>Cargando...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Panel de Administración</h1>
                <div className={styles.tabs}>
                    {/* Leads tab */}
                    <button
                        className={`${styles.tab} ${selectedTab === 'leads' ? styles.active : ''}`}
                        onClick={() => setSelectedTab('leads')}
                    >
                        Leads
                    </button>
                    {/* Users tab */}
                    <button
                        className={`${styles.tab} ${selectedTab === 'users' ? styles.active : ''}`}
                        onClick={() => setSelectedTab('users')}
                    >
                        Usuarios
                    </button>
                    {/* Products tab */}
                    <button
                        className={`${styles.tab} ${selectedTab === 'products' ? styles.active : ''}`}
                        onClick={() => setSelectedTab('products')}
                    >
                        Productos
                    </button>
                    {/* Orders tab */}
                    <button
                        className={`${styles.tab} ${selectedTab === 'orders' ? styles.active : ''}`}
                        onClick={() => setSelectedTab('orders')}
                    >
                        Orders
                    </button>
                </div>
                <div className={styles.actions}>
                    {selectedTab === 'leads' && (
                        <button
                            className={styles.actionButton}
                            onClick={handleSendAccountEmails}
                        >
                            Enviar Emails de Creación de Cuenta
                        </button>
                    )}
                    <button
                        className={styles.newsletterButton}
                        onClick={() => setShowNewsletter(!showNewsletter)}
                    >
                        {showNewsletter ? 'Cerrar Newsletter' : 'Enviar Newsletter'}
                    </button>
                </div>
            </div>

            {showNewsletter && (
                <div className={styles.newsletterContainer}>
                    <NewsletterForm onSend={handleNewsletterSend} />
                </div>
            )}

            <div className={styles.content}>
                {/* Render tables based on tab */}
                {selectedTab === 'leads' && <LeadsTable leads={leads} />}
                {selectedTab === 'users' && <LeadsTable leads={users} isUsers={true} />}
                {selectedTab === 'products' && <ProductsTable products={products} />}
                {selectedTab === 'orders' && <OrdersTable orders={orders} />}
            </div>
        </div>
    );
}
