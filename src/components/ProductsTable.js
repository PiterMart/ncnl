// components/ProductsTable.js
"use client";

import { useState, useEffect } from "react";
import styles from "../styles/ProductsTable.module.css";
import { productService } from "../services/productService";

/** 
 * Modal component: overlay + inner content 
 */
function Modal({ isOpen, onClose, children }) {
    if (!isOpen) return null;
    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
}

/**
 * ProductsTable component:
 * - subscribes in real time a Firestore
 * - muestra la tabla
 * - abre modal para agregar nuevos productos
 */
export default function ProductsTable() {
    // Local state for products list
    const [products, setProducts] = useState([]);
    // Modal & form states
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
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    // Subscribe to Firestore on mount
    useEffect(() => {
        const unsubscribe = productService.subscribeToProducts(
            (snapshotProducts) => {
                // real-time update from server
                setProducts(snapshotProducts);
            },
            (err) => {
                console.error("Error en suscripción:", err);
            }
        );
        return () => unsubscribe();
    }, []);

    // Handlers for modal open/close
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => {
        setError("");
        setIsModalOpen(false);
    };

    // Update form fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    };

    // Submit form: optimistic + real-time
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError("");
        try {
            // 1) Save to Firestore
            const newId = await productService.addProduct(formValues);

            // 2) Optimistic update: show nuevo producto al toque
            setProducts((prev) => [
                { id: newId, ...formValues },
                ...prev,
            ]);

            // 3) Reset form & close
            setFormValues({
                name: "",
                technicalDescription: "",
                price: "",
                stock: "",
                collection: "",
                size: "",
                color: "",
            });
            handleCloseModal();
        } catch (err) {
            console.error("Error guardando producto:", err);
            setError("No se pudo guardar el producto.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.tableContainer}>
            {/* Botón para abrir el modal */}
            <button
                className={styles.openModalButton}
                onClick={handleOpenModal}
                disabled={isSaving}
            >
                {isSaving ? "Guardando…" : "Agregar producto"}
            </button>

            {/* Modal con formulario */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                <h2>Agregar nuevo producto</h2>
                {error && <p className={styles.errorText}>{error}</p>}
                <form onSubmit={handleSubmit} className={styles.form}>
                    {[
                        { id: "name", label: "Nombre de la prenda", type: "text", required: true },
                        {
                            id: "technicalDescription",
                            label: "Descripción Técnica Textil",
                            type: "text",
                        },
                        { id: "price", label: "Precio", type: "number", step: "0.01", required: true },
                        { id: "stock", label: "Stock", type: "number", required: true },
                        { id: "collection", label: "Colección", type: "text" },
                        { id: "size", label: "Talle", type: "text" },
                        { id: "color", label: "Color", type: "text" },
                    ].map(({ id, label, ...rest }) => (
                        <div key={id} className={styles.formGroup}>
                            <label htmlFor={id}>{label}</label>
                            <input
                                id={id}
                                name={id}
                                value={formValues[id]}
                                onChange={handleChange}
                                {...rest}
                                className={styles.input}
                            />
                        </div>
                    ))}

                    <div className={styles.formActions}>
                        <button type="submit" disabled={isSaving}>
                            Guardar
                        </button>
                        <button type="button" onClick={handleCloseModal} disabled={isSaving}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Tabla con datos en tiempo real */}
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Descripción Técnica</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Colección</th>
                        <th>Talle</th>
                        <th>Color</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((p) => (
                        <tr key={p.id}>
                            <td>{p.name}</td>
                            <td>{p.technicalDescription}</td>
                            <td>{p.price}</td>
                            <td>{p.stock}</td>
                            <td>{p.collection}</td>
                            <td>{p.size}</td>
                            <td>{p.color}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {products.length === 0 && (
                <div className={styles.emptyMessage}>No hay productos para mostrar</div>
            )}
        </div>
    );
}
