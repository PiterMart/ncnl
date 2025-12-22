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
 * - subscribes in real time to Firestore
 * - displays, adds, edits and deletes products
 */
export default function ProductsTable() {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Initial form values, now including "category", stock for sizes, and video
    const initialForm = {
        name: "",
        description: "",
        technicalDescription: "",
        price: "",
        collection: "",
        color: "",
        material: "",
        category: "", // category field
        stock1: 0, // Stock for size 1
        stock2: 0, // Stock for size 2
        stock3: 0, // Stock for size 3
    };
    const [formValues, setFormValues] = useState(initialForm);
    const [selectedImages, setSelectedImages] = useState([]); // File[]
    const [selectedVideo, setSelectedVideo] = useState(null); // File | null
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    // Real-time subscription
    useEffect(() => {
        const unsubscribe = productService.subscribeToProducts(
            setProducts,
            (err) => console.error("Error in subscription:", err)
        );
        return () => unsubscribe();
    }, []);

    // Open add modal
    const handleOpenAdd = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormValues(initialForm);
        setSelectedImages([]);
        setSelectedVideo(null);
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
            category: product.category || "", // Load existing category
            stock1: product.stock1 || 0, // Load existing stock for size 1
            stock2: product.stock2 || 0, // Load existing stock for size 2
            stock3: product.stock3 || 0, // Load existing stock for size 3
        });
        setSelectedImages([]); // do not change images unless new ones uploaded
        setSelectedVideo(null); // do not change video unless new one uploaded
        setIsModalOpen(true);
    };

    // Close modal
    const handleCloseModal = () => {
        setError("");
        setIsModalOpen(false);
        setSelectedImages([]);
        setSelectedVideo(null);
    };

    // Handle input/select change
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        // Convert number inputs to numbers
        const processedValue = type === "number" ? (value === "" ? 0 : Number(value)) : value;
        setFormValues((prev) => ({ ...prev, [name]: processedValue }));
    };

    // Handle file input change
    const handleImageChange = (e) => {
        setSelectedImages(e.target.files);
    };

    // Handle video file input change
    const handleVideoChange = (e) => {
        const file = e.target.files[0] || null;
        setSelectedVideo(file);
    };

    // Delete product
    const handleDelete = async (id) => {
        if (!confirm("¿Eliminar este producto?")) return;
        try {
            await productService.deleteProduct(id);
        } catch (err) {
            console.error("Error deleting product:", err);
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
                // 1) Update fields (including category and stock)
                await productService.updateProduct(editingId, formValues);
                // 2) If new images uploaded: upload and update
                if (selectedImages.length > 0) {
                    const urls = await imageService.uploadImages(editingId, selectedImages);
                    await productService.updateProductImages(editingId, urls);
                }
                // 3) If new video uploaded: upload and update
                if (selectedVideo) {
                    const videoUrl = await imageService.uploadVideo(editingId, selectedVideo);
                    await productService.updateProductVideo(editingId, videoUrl);
                }
            } else {
                // 1) Add new product (with category and stock)
                const newId = await productService.addProduct(formValues);
                // 2) If images exist: upload and update
                if (selectedImages.length > 0) {
                    const urls = await imageService.uploadImages(newId, selectedImages);
                    await productService.updateProductImages(newId, urls);
                }
                // 3) If video exists: upload and update
                if (selectedVideo) {
                    const videoUrl = await imageService.uploadVideo(newId, selectedVideo);
                    await productService.updateProductVideo(newId, videoUrl);
                }
            }
            handleCloseModal();
        } catch (err) {
            console.error("Error saving product:", err);
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
                        { id: "collection", label: "Colección", type: "text", required: true },
                        { id: "color", label: "Color", type: "text", required: true },
                        { id: "material", label: "Material", type: "text", required: true },
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

                    {/* Category select field */}
                    <div className={styles.formGroup}>
                        <label htmlFor="category">Categoría</label>
                        <select
                            id="category"
                            name="category"
                            value={formValues.category}
                            onChange={handleChange}
                            required
                            className={styles.input}
                        >
                            <option value="">-- Seleccionar --</option>
                            <option value="Campera">Campera</option>
                            <option value="Buzo">Buzo</option>
                            <option value="Remera">Remera</option>
                            <option value="Pantalon">Pantalón</option>
                            <option value="Chaleco">Chaleco</option>
                            <option value="Camisa">Camisa</option>
                            <option value="Gorra">Gorra</option>
                            <option value="Botas">Botas</option>
                            <option value="Morral">Morral</option>
                        </select>
                    </div>

                    {/* Stock fields for sizes 1, 2, 3 */}
                    <div className={styles.formGroup}>
                        <label>Stock por Talle</label>
                        <div style={{ display: "flex", gap: "1rem" }}>
                            <div style={{ flex: 1 }}>
                                <label htmlFor="stock1" style={{ fontSize: "0.9rem", marginBottom: "0.25rem", display: "block" }}>
                                    Talle 1
                                </label>
                                <input
                                    id="stock1"
                                    name="stock1"
                                    type="number"
                                    min="0"
                                    value={formValues.stock1}
                                    onChange={handleChange}
                                    className={styles.input}
                                    required
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label htmlFor="stock2" style={{ fontSize: "0.9rem", marginBottom: "0.25rem", display: "block" }}>
                                    Talle 2
                                </label>
                                <input
                                    id="stock2"
                                    name="stock2"
                                    type="number"
                                    min="0"
                                    value={formValues.stock2}
                                    onChange={handleChange}
                                    className={styles.input}
                                    required
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label htmlFor="stock3" style={{ fontSize: "0.9rem", marginBottom: "0.25rem", display: "block" }}>
                                    Talle 3
                                </label>
                                <input
                                    id="stock3"
                                    name="stock3"
                                    type="number"
                                    min="0"
                                    value={formValues.stock3}
                                    onChange={handleChange}
                                    className={styles.input}
                                    required
                                />
                            </div>
                        </div>
                    </div>

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

                    <div className={styles.formGroup}>
                        <label htmlFor="video">
                            {isEditing ? "Nuevo video (opcional)" : "Video"}
                        </label>
                        <input
                            id="video"
                            type="file"
                            accept="video/*"
                            onChange={handleVideoChange}
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
                        <th>Descripción</th>
                        {/* <th>Descripción Técnica</th> */}
                        <th>Precio</th>
                        <th>Stock T1</th>
                        <th>Stock T2</th>
                        <th>Stock T3</th>
                        <th>Colección</th>
                        <th>Color</th>
                        <th>Material</th>
                        <th>Categoría</th>
                        <th>Imágenes</th>
                        <th>Video</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((p) => (
                        <tr key={p.id}>
                            <td>{p.name}</td>
                            <td>{p.description}</td>
                            {/* <td>{p.technicalDescription}</td> */}
                            <td>{p.price}</td>
                            <td>{p.stock1 ?? 0}</td>
                            <td>{p.stock2 ?? 0}</td>
                            <td>{p.stock3 ?? 0}</td>
                            <td>{p.collection}</td>
                            <td>{p.color}</td>
                            <td>{p.material}</td>
                            <td>{p.category}</td>
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
                            <td>
                                {p.video ? (
                                    <video
                                        src={p.video}
                                        controls
                                        style={{ width: "100px", height: "60px", objectFit: "cover" }}
                                    />
                                ) : (
                                    <span style={{ color: "#999" }}>Sin video</span>
                                )}
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
