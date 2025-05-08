// components/ProductsTable.js
"use client";

import { useState } from "react";
import styles from "../styles/ProductsTable.module.css";

/**
 * Modal component: single responsibility for overlay and content
 */
function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null;

    return (
        <div
            className={styles.modalOverlay}
            onClick={onClose} // close when clicking outside
        >
            <div
                className={styles.modalContent}
                onClick={(e) => e.stopPropagation()} // prevent closing inside
            >
                <button className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
}

/**
 * ProductsTable component: muestra productos y maneja modal
 */
export default function ProductsTable({ products }) {
    const [selectedRows, setSelectedRows] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formValues, setFormValues] = useState({
        name: "",
        technicalDescription: "",
        price: "",
        stock: "",
        collection: "",
        size: "",
        color: "",
    });

    // toggle select all
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedRows([]);
        } else {
            setSelectedRows(products.map((p) => p.id));
        }
        setSelectAll(!selectAll);
    };

    // toggle single row
    const handleRowSelect = (id) => {
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    // update form state
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    };

    // submit form
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Valores nuevo producto:", formValues);
        // TODO: enviar a API o actualizar estado
        handleCloseModal();
    };

    return (
        <div className={styles.tableContainer}>
            <button className={styles.openModalButton} onClick={handleOpenModal}>
                Agregar producto
            </button>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                <h2>Agregar nuevo producto</h2>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name">Nombre de la prenda</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formValues.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="technicalDescription">
                            Descripción Técnica Textil
                        </label>
                        <input
                            id="technicalDescription"
                            name="technicalDescription"
                            type="text"
                            value={formValues.technicalDescription}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="price">Precio</label>
                        <input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            value={formValues.price}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="stock">Stock</label>
                        <input
                            id="stock"
                            name="stock"
                            type="number"
                            value={formValues.stock}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="collection">Colección</label>
                        <input
                            id="collection"
                            name="collection"
                            type="text"
                            value={formValues.collection}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="size">Talle</label>
                        <input
                            id="size"
                            name="size"
                            type="text"
                            value={formValues.size}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="color">Color</label>
                        <input
                            id="color"
                            name="color"
                            type="text"
                            value={formValues.color}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.formActions}>
                        <button type="submit">Guardar</button>
                        <button type="button" onClick={handleCloseModal}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </Modal>

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
                        <th>Descripción Técnica</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Colección</th>
                        <th>Talle</th>
                        <th>Color</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
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
