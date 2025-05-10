// app/admin/page.js or pages/admin.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from "../../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query } from "firebase/firestore";
import LeadsTable from '../../components/LeadsTable';
import ProductsTable from '../../components/ProductsTable'; // Import de la nueva tabla
import NewsletterForm from '../../components/NewsletterForm';
import styles from '../../styles/AdminDashboard.module.css';

export default function AdminDashboard() {
    // Estados para cada tipo de datos
    const [leads, setLeads] = useState([]);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]); // Estado para products
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTab, setSelectedTab] = useState('leads');
    const [showNewsletter, setShowNewsletter] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Observa el estado de autenticación
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                router.push('/login');
                return;
            }

            try {
                // Fetch leads
                const leadsSnapshot = await getDocs(query(collection(db, "leads")));
                setLeads(leadsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // Fetch users
                const usersSnapshot = await getDocs(query(collection(db, "users")));
                setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // Fetch products
                const productsSnapshot = await getDocs(query(collection(db, "products")));
                setProducts(productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                setLoading(false);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Error al cargar los datos");
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [router]);

    // Envía emails de creación de cuenta para leads
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

            // Actualiza estado local
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

    // Envía newsletter según pestaña seleccionada
    const handleNewsletterSend = async (newsletterData) => {
        try {
            const recipients = selectedTab === 'leads'
                ? leads
                : selectedTab === 'users'
                    ? users
                    : products; // Envío a products si está seleccionado
            await fetch('/api/send-newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newsletterData,
                    recipients: recipients.map(r => r.email),
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
                    {/* Pestañas */}
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
                {/* Contenido según pestaña */}
                {selectedTab === 'leads' && <LeadsTable leads={leads} />}
                {selectedTab === 'users' && <LeadsTable leads={users} isUsers={true} />}
                {selectedTab === 'products' && <ProductsTable products={products} />}
            </div>
        </div>
    );
}
