"use client";

import { useState } from 'react';
import styles from '../styles/LeadsTable.module.css';

export default function LeadsTable({ leads, selectedLeads, setSelectedLeads }) {
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedLeads = [...leads].sort((a, b) => {
    if (sortConfig.key === 'createdAt') {
      return sortConfig.direction === 'asc'
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    }
    return sortConfig.direction === 'asc'
      ? a[sortConfig.key].localeCompare(b[sortConfig.key])
      : b[sortConfig.key].localeCompare(a[sortConfig.key]);
  });

  const handleSelectLead = (lead) => {
    setSelectedLeads(prev => {
      const isSelected = prev.some(l => l.id === lead.id);
      if (isSelected) {
        return prev.filter(l => l.id !== lead.id);
      } else {
        return [...prev, lead];
      }
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectedLeads.length === leads.length}
                onChange={() => {
                  if (selectedLeads.length === leads.length) {
                    setSelectedLeads([]);
                  } else {
                    setSelectedLeads([...leads]);
                  }
                }}
              />
            </th>
            <th onClick={() => handleSort('name')}>
              Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('email')}>
              Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('birthdate')}>
              Birthdate {sortConfig.key === 'birthdate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('status')}>
              Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('createdAt')}>
              Created At {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
            </th>
            <th>Account Email Sent</th>
            <th>Has Account</th>
          </tr>
        </thead>
        <tbody>
          {sortedLeads.map((lead) => (
            <tr key={lead.id} className={selectedLeads.some(l => l.id === lead.id) ? styles.selected : ''}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedLeads.some(l => l.id === lead.id)}
                  onChange={() => handleSelectLead(lead)}
                />
              </td>
              <td>{lead.name}</td>
              <td>{lead.email}</td>
              <td>{lead.birthdate}</td>
              <td>{lead.status}</td>
              <td>{formatDate(lead.createdAt)}</td>
              <td>{lead.accountEmailSent ? 'Yes' : 'No'}</td>
              <td>{lead.hasAccount ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 