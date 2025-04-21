// app/admin/page.js or pages/admin.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from "../../firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import LeadsTable from '../../components/LeadsTable';
import NewsletterForm from '../../components/NewsletterForm';
import styles from '../../styles/AdminDashboard.module.css';

export default function AdminDashboard() {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('leads');
  const [showNewsletter, setShowNewsletter] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch leads
          const leadsQuery = query(collection(db, "leads"));
          const leadsSnapshot = await getDocs(leadsQuery);
          const leadsData = leadsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setLeads(leadsData);

          // Fetch users
          const usersQuery = query(collection(db, "users"));
          const usersSnapshot = await getDocs(usersQuery);
          const usersData = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setUsers(usersData);

          setLoading(false);
        } catch (err) {
          console.error("Error fetching data:", err);
          setError("Error al cargar los datos");
          setLoading(false);
        }
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSendAccountEmails = async () => {
    try {
      const leadsWithoutAccount = leads.filter(lead => !lead.hasAccount);
      const leadIds = leadsWithoutAccount.map(lead => lead.id);

      const response = await fetch('/api/send-account-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leadIds }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar los emails');
      }

      // Update local leads state with new status
      const updatedLeads = leads.map(lead => {
        if (leadIds.includes(lead.id)) {
          return {
            ...lead,
            accountEmailSent: true,
            status: 'pending'
          };
        }
        return lead;
      });
      setLeads(updatedLeads);

      alert('Emails de creación de cuenta enviados exitosamente');
    } catch (err) {
      console.error('Error sending account emails:', err);
      alert('Error al enviar los emails de creación de cuenta');
    }
  };

  const handleNewsletterSend = async (newsletterData) => {
    try {
      const recipients = selectedTab === 'leads' ? leads : users;
      await fetch('/api/send-newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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

  if (loading) {
    return <div className={styles.loading}>Cargando...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

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
        {selectedTab === 'leads' ? (
          <LeadsTable leads={leads} />
        ) : (
          <LeadsTable leads={users} isUsers={true} />
        )}
      </div>
    </div>
  );
}
