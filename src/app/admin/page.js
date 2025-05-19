// src/app/admin/page.js
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
    const [users, setUsers] = useState([]); // Keep for display purposes if needed
    const [products, setProducts] = useState([]); // Keep for display purposes
    const [orders, setOrders] = useState([]); // Keep for display purposes
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // UI states
    const [selectedTab, setSelectedTab] = useState('leads'); // Still useful for displaying different tables
    const [showNewsletter, setShowNewsletter] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push('/login');
                return;
            }
            try {
                const [leadsSnap, usersSnap, productsSnap, ordersSnap] = await Promise.all([
                    getDocs(query(collection(db, "leads"))),
                    getDocs(query(collection(db, "users"))),
                    getDocs(query(collection(db, "products"))),
                    getDocs(query(collection(db, "orders"))),
                ]);

                setLeads(leadsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setUsers(usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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

    // Send newsletter ONLY to leads
    const handleNewsletterSend = async (newsletterData) => {
        try {
            // Ensure there are leads to send to
            if (!leads || leads.length === 0) {
                alert('No leads available to send newsletters to.');
                return;
            }
            const recipients = leads.map(lead => lead.email).filter(email => email); // Ensure email exists

            if (recipients.length === 0) {
                alert('No leads with valid email addresses found.');
                return;
            }

            await fetch('/api/send-newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newsletterData,
                    recipients,
                    // recipientType: 'leads' // You can optionally send this if the backend still expects it
                }),
            });

            alert('Newsletter enviado exitosamente a los leads');
            setShowNewsletter(false); // Optionally close the form
        } catch (err) {
            console.error('Error sending newsletter:', err);
            alert('Error al enviar el newsletter');
        }
    };

    if (loading) return <div className={styles.loading}>Cargando...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    // The newsletter button is now universal and will always target leads
    // No need to conditionally render it based on selectedTab for newsletter sending logic.
    // The selectedTab will still control which table is displayed.

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Panel de Administración</h1>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${selectedTab === 'leads' ? styles.active : ''}`}
                        onClick={() => setSelectedTab('leads')}
                    >
                        Leads
                    </button>
                    <button
                        className={`${styles.tab} ${selectedTab === 'users' ? styles.active : ''}`}
                        onClick={() => setSelectedTab('users')}
                    >
                        Usuarios
                    </button>
                    <button
                        className={`${styles.tab} ${selectedTab === 'products' ? styles.active : ''}`}
                        onClick={() => setSelectedTab('products')}
                    >
                        Productos
                    </button>
                    <button
                        className={`${styles.tab} ${selectedTab === 'orders' ? styles.active : ''}`}
                        onClick={() => setSelectedTab('orders')}
                    >
                        Orders
                    </button>
                </div>
                <div className={styles.actions}>
                    {selectedTab === 'leads' && ( // This button is specific to leads
                        <button
                            className={styles.actionButton}
                            onClick={handleSendAccountEmails}
                        >
                            Enviar Emails de Creación de Cuenta
                        </button>
                    )}
                    {/* Newsletter button always available, always sends to leads */}
                    <button
                        className={styles.newsletterButton}
                        onClick={() => setShowNewsletter(!showNewsletter)}
                    >
                        {showNewsletter ? 'Cerrar Newsletter' : 'Enviar Newsletter a Leads'}
                    </button>
                </div>
            </div>

            {showNewsletter && (
                <div className={styles.newsletterContainer}>
                    <NewsletterForm onSend={handleNewsletterSend} />
                </div>
            )}

            <div className={styles.content}>
                {selectedTab === 'leads' && <LeadsTable leads={leads} />}
                {selectedTab === 'users' && <LeadsTable leads={users} isUsers={true} />}
                {selectedTab === 'products' && <ProductsTable products={products} />}
                {selectedTab === 'orders' && <OrdersTable orders={orders} />}
            </div>
        </div>
    );
}