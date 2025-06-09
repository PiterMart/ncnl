"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from "../../firebase/firebaseConfig"; // Make sure this path is correct
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query } from "firebase/firestore";
import LeadsTable from '../../components/LeadsTable'; // Make sure this path is correct
import ProductsTable from '../../components/ProductsTable'; // Make sure this path is correct
import OrdersTable from '../../components/OrdersTable'; // Make sure this path is correct
import NewsletterForm from '../../components/NewsletterForm'; // Make sure this path is correct
import styles from '../../styles/AdminDashboard.module.css'; // Make sure this path is correct

export default function AdminDashboard() {
    // Data states
    const [leads, setLeads] = useState([]);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // UI states
    const [selectedTab, setSelectedTab] = useState('leads');
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

            const response = await fetch('/api/send-account-emails', { // Ensure this API route exists and works
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

    // Send newsletter ALWAYS to leads
    const handleNewsletterSend = async (newsletterData) => {
        try {
            // Determine recipients: ALWAYS leads
            const recipients = leads.map(lead => lead.email).filter(email => email); // Filter out any undefined/null emails

            if (recipients.length === 0) {
                alert('No leads found with email addresses to send the newsletter to.');
                return;
            }

            const response = await fetch('/api/send-newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newsletterData,
                    recipients, // Only send recipients array
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                 throw new Error(result.error || 'Error al iniciar el envío del newsletter');
            }

            alert(`Newsletter sending process started for ${recipients.length} leads. Check logs or database for status.`);
            setShowNewsletter(false); // Optionally close the form
        } catch (err) {
            console.error('Error sending newsletter:', err);
            alert(err.message || 'Error al enviar el newsletter');
        }
    };

    if (loading) return <div className={styles.loading}>Cargando...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

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
                    {selectedTab === 'leads' && (
                        <button
                            className={styles.actionButton}
                            onClick={handleSendAccountEmails}
                        >
                            Enviar Emails de Creación de Cuenta
                        </button>
                    )}
                    {/* Newsletter button is always available, but will always send to leads */}
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
                {/* Assuming LeadsTable can also display users by checking isUsers prop */}
                {selectedTab === 'users' && <LeadsTable leads={users} isUsers={true} />}
                {selectedTab === 'products' && <ProductsTable products={products} />}
                {selectedTab === 'orders' && <OrdersTable orders={orders} />}
            </div>
        </div>
    );
}