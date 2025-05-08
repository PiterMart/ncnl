// components/ProductsTable.js
"use client";

import { useState } from "react";
import styles from "../styles/ProductsTable.module.css"; // Asegurate de crear este módulo CSS

export default function ProductsTable({ products }) {
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    // Toggle selection of all rows
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedRows([]);
        } else {
            setSelectedRows(products.map(product => product.id));
        }
        setSelectAll(!selectAll);
    };

    // Toggle selection of a single row by id
    const handleRowSelect = (id) => {
        setSelectedRows(prev =>
            prev.includes(id)
                ? prev.filter(rowId => rowId !== id)
                : [...prev, id]
        );
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
                        <th>Nombre de la prenda</th>
                        <th>Descripción Técnica Textil</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Colección</th>
                        <th>Talle</th>
                        <th>Color</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id} className={styles.row}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={selectedRows.includes(product.id)}
                                    onChange={() => handleRowSelect(product.id)}
                                    className={styles.checkbox}
                                />
                            </td>
                            <td>{product.name}</td>
                            <td>{product.technicalDescription}</td>
                            <td>{product.price}</td>
                            <td>{product.stock}</td>
                            <td>{product.collection}</td>
                            <td>{product.size}</td>
                            <td>{product.color}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {products.length === 0 && (
                <div className={styles.emptyMessage}>
                    No hay productos para mostrar
                </div>
            )}
        </div>
    );
}
