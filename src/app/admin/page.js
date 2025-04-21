// app/admin/page.js or pages/admin.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LeadsTable from '../components/LeadsTable';
import SendEmailsModal from '../components/SendEmailsModal';
import styles from '../../styles/Admin.module.css';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [leads, setLeads] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    const storedAuth = localStorage.getItem('adminAuth');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
      fetchLeads();
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
      fetchLeads();
    } else {
      setError('Invalid password');
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leads');
      if (!response.ok) {
        throw new Error('Failed to fetch leads');
      }
      const data = await response.json();
      // Transform the data to match the expected structure
      const formattedLeads = data.leads.map(lead => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        birthdate: lead.birthdate,
        status: lead.status,
        hasAccount: lead.hasAccount,
        accountEmailSent: lead.accountEmailSent,
        createdAt: lead.createdAt,
        accountToken: lead.accountToken
      }));
      setLeads(formattedLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setError('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmails = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/send-account-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadIds: selectedLeads.map(lead => lead.id)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send emails');
      }

      // Refresh leads data after sending emails
      await fetchLeads();
      setShowModal(false);
      setSelectedLeads([]);
    } catch (error) {
      console.error('Error sending emails:', error);
      setError('Failed to send emails');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.loginForm}>
          <h2>Admin Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className={styles.input}
            />
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.button}>
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Dashboard</h1>
      
      <div className={styles.actions}>
        <button
          onClick={() => setShowModal(true)}
          className={styles.button}
          disabled={selectedLeads.length === 0 || loading}
        >
          Send Account Creation Emails
        </button>
        <button
          onClick={fetchLeads}
          className={styles.button}
          disabled={loading}
        >
          Refresh Leads
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <LeadsTable 
          leads={leads} 
          selectedLeads={selectedLeads}
          setSelectedLeads={setSelectedLeads}
        />
      )}

      {showModal && (
        <SendEmailsModal
          leads={selectedLeads}
          onClose={() => setShowModal(false)}
          onConfirm={handleSendEmails}
        />
      )}
    </div>
  );
}
