"use client";

import { useState } from "react";
import styles from "../styles/LeadsTable.module.css";

export default function LeadsTable({ leads, isUsers = false }) {
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(leads.map(lead => lead.id));
    }
    setSelectAll(!selectAll);
  };

  const handleRowSelect = (id) => {
    setSelectedRows(prev => {
      if (prev.includes(id)) {
        return prev.filter(rowId => rowId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate();
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className={styles.checkbox}
              />
            </th>
            <th>Nombre</th>
            <th>Email</th>
            {!isUsers && <th>Estado</th>}
            {!isUsers && <th>Cuenta Creada</th>}
            <th>Fecha de Registro</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className={styles.row}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedRows.includes(lead.id)}
                  onChange={() => handleRowSelect(lead.id)}
                  className={styles.checkbox}
                />
              </td>
              <td>{lead.firstName} {lead.lastName}</td>
              <td>{lead.email}</td>
              {!isUsers && <td>{lead.status || '-'}</td>}
              {!isUsers && <td>{lead.hasAccount ? 'Sí' : 'No'}</td>}
              <td>{formatDate(lead.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {leads.length === 0 && (
        <div className={styles.emptyMessage}>
          No hay {isUsers ? 'usuarios' : 'leads'} para mostrar
        </div>
      )}
    </div>
  );
} 