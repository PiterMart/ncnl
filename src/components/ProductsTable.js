// src/components/ProductsTable.js
"use client";

import { useState, useEffect } from "react";
import styles from "../styles/ProductsTable.module.css";
import { productService } from "../services/productService";
import { imageService } from "../services/imageService";

/** Modal component: overlay + inner content */
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
 * - se suscribe en tiempo real a Firestore
 * - muestra productos + imágenes
 * - abre modal para agregar nuevos productos con varias imágenes
 */
export default function ProductsTable() {
    const [products, setProducts] = useState([]);
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
    const [selectedImages, setSelectedImages] = useState([]); // File[]
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    // Suscripción en tiempo real
    useEffect(() => {
        const unsubscribe = productService.subscribeToProducts(
            (snapshotProducts) => {
                setProducts(snapshotProducts);
            },
            (err) => console.error("Error en suscripción:", err)
        );
        return () => unsubscribe();
    }, []);

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => {
        setError("");
        setIsModalOpen(false);
        setSelectedImages([]);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        setSelectedImages(e.target.files);
    };

    // Ya no modificamos products aquí; la suscripción lo hará por nosotros
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError("");

        try {
            // 1) Crear documento sin imágenes
            const newId = await productService.addProduct(formValues);

            // 2) Si hay imágenes, subirlas y actualizar Firestore
            if (selectedImages.length > 0) {
                const urls = await imageService.uploadImages(newId, selectedImages);
                await productService.updateProductImages(newId, urls);
            }

            // 3) Reset form y cerrar modal
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
            setError("No se pudo guardar el producto con imágenes.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.tableContainer}>
            <button
                className={styles.openModalButton}
                onClick={handleOpenModal}
                disabled={isSaving}
            >
                {isSaving ? "Guardando…" : "Agregar producto"}
            </button>

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

                    <div className={styles.formGroup}>
                        <label htmlFor="images">Imágenes</label>
                        <input
                            id="images"
                            name="images"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                            className={styles.input}
                        />
                    </div>

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
                        <th>Imágenes</th>
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
                            <td>
                                {p.images?.map((url, i) => (
                                    <img
                                        key={i}
                                        src={url}
                                        alt={`Producto ${p.name} #${i + 1}`}
                                        className={styles.thumbnail}
                                    />
                                ))}
                            </td>
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
