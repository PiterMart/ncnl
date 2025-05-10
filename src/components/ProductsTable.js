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
 * - suscribe en tiempo real a Firestore
 * - muestra, agrega, edita y elimina productos
 */
export default function ProductsTable() {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const initialForm = {
        name: "",
        description: "",
        technicalDescription: "",
        price: "",
        collection: "",
        color: "",
        material: "",
        // stock: "",
        // size: "",
    };
    const [formValues, setFormValues] = useState(initialForm);
    const [selectedImages, setSelectedImages] = useState([]); // File[]
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    // Suscripción en tiempo real
    useEffect(() => {
        const unsubscribe = productService.subscribeToProducts(
            setProducts,
            (err) => console.error("Error en suscripción:", err)
        );
        return () => unsubscribe();
    }, []);

    // Open add modal
    const handleOpenAdd = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormValues(initialForm);
        setSelectedImages([]);
        setIsModalOpen(true);
    };

    // Open edit modal
    const handleOpenEdit = (product) => {
        setIsEditing(true);
        setEditingId(product.id);
        setFormValues({
            name: product.name,
            description: product.description,
            technicalDescription: product.technicalDescription,
            price: product.price,
            collection: product.collection,
            color: product.color,
            material: product.material,
            // size: product.size,
            // stock: product.stock,
        });
        setSelectedImages([]); // no cambiar imágenes a menos que suban nuevas
        setIsModalOpen(true);
    };

    // Close modal
    const handleCloseModal = () => {
        setError("");
        setIsModalOpen(false);
        setSelectedImages([]);
    };

    // Input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    };

    // File input change
    const handleImageChange = (e) => {
        setSelectedImages(e.target.files);
    };

    // Delete product
    const handleDelete = async (id) => {
        if (!confirm("¿Eliminar este producto?")) return;
        try {
            await productService.deleteProduct(id);
        } catch (err) {
            console.error("Error eliminando producto:", err);
            alert("No se pudo eliminar el producto.");
        }
    };

    // Submit form (add or edit)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError("");

        try {
            if (isEditing && editingId) {
                // 1) Update fields
                await productService.updateProduct(editingId, formValues);
                // 2) If suben imágenes nuevas: subir y actualizar
                if (selectedImages.length > 0) {
                    const urls = await imageService.uploadImages(editingId, selectedImages);
                    await productService.updateProductImages(editingId, urls);
                }
            } else {
                // 1) Añadir nuevo
                const newId = await productService.addProduct(formValues);
                // 2) Si hay imágenes: subir y actualizar
                if (selectedImages.length > 0) {
                    const urls = await imageService.uploadImages(newId, selectedImages);
                    await productService.updateProductImages(newId, urls);
                }
            }
            handleCloseModal();
        } catch (err) {
            console.error("Error guardando producto:", err);
            setError("No se pudo guardar los cambios.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.tableContainer}>
            <div className={styles.topBar}>
                <button
                    className={styles.openModalButton}
                    onClick={handleOpenAdd}
                    disabled={isSaving}
                >
                    Agregar producto
                </button>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                <h2>{isEditing ? "Editar producto" : "Agregar nuevo producto"}</h2>
                {error && <p className={styles.errorText}>{error}</p>}
                <form onSubmit={handleSubmit} className={styles.form}>
                    {[
                        { id: "name", label: "Nombre de la prenda", type: "text", required: true },
                        { id: "description", label: "Descripción", type: "text", required: true },
                        {
                            id: "technicalDescription",
                            label: "Descripción Técnica Textil",
                            type: "text",
                            required: true,
                        },
                        { id: "price", label: "Precio", type: "number", step: "0.01", required: true },
                        { id: "collection", label: "Colección", type: "text",required: true  },
                        { id: "color", label: "Color", type: "text", required: true  },
                        { id: "material", label: "Material", type: "text", required: true  },
                        // { id: "size", label: "Talle", type: "text" },
                        // { id: "stock", label: "Stock", type: "number", required: true },
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
                        <label htmlFor="images">
                            {isEditing ? "Nuevas imágenes (opcional)" : "Imágenes"}
                        </label>
                        <input
                            id="images"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formActions}>
                        <button type="submit" disabled={isSaving}>
                            {isSaving
                                ? isEditing
                                    ? "Guardando…"
                                    : "Guardando…"
                                : isEditing
                                    ? "Actualizar"
                                    : "Guardar"}
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
                        <th>Colección</th>
                        <th>Color</th>
                        <th>Material</th>
                        <th>Imágenes</th>
                        <th>Acciones</th>
                        {/* <th>Stock</th> */}
                        {/* <th>Talle</th> */}
                    </tr>
                </thead>
                <tbody>
                    {products.map((p) => (
                        <tr key={p.id}>
                            <td>{p.name}</td>
                            <td>{p.description}</td>
                            <td>{p.technicalDescription}</td>
                            <td>{p.price}</td>
                            <td>{p.stock}</td>
                            <td>{p.collection}</td>
                            <td>{p.size}</td>
                            <td>{p.color}</td>
                            <td>{p.material}</td>
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
                            <td className={styles.actionCell}>
                                <button
                                    className={styles.editButton}
                                    onClick={() => handleOpenEdit(p)}
                                >
                                    Editar
                                </button>
                                <button
                                    className={styles.deleteButton}
                                    onClick={() => handleDelete(p.id)}
                                >
                                    Eliminar
                                </button>
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
