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
    const [expandedProducts, setExpandedProducts] = useState(new Set());

    // Initial form values, now including "category", stock for sizes, video, and new flag
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
        new: false, // New product flag
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
            new: product.new || false, // Load existing new flag
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
        const { name, value, type, checked } = e.target;
        // Convert number inputs to numbers, checkbox to boolean
        let processedValue;
        if (type === "number") {
            processedValue = value === "" ? 0 : Number(value);
        } else if (type === "checkbox") {
            processedValue = checked;
        } else {
            processedValue = value;
        }
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

    // Toggle product expansion
    const toggleProduct = (id) => {
        setExpandedProducts((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    // Delete product
    const handleDelete = async (id) => {
        if (!confirm("¿Eliminar este producto?")) return;
        try {
            await productService.deleteProduct(id);
            // Remove from expanded set if it was expanded
            setExpandedProducts((prev) => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
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
                            <option value="Short">Short</option>
                        </select>
                    </div>

                    {/* New product checkbox */}
                    <div className={styles.formGroup}>
                        <label htmlFor="new" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <input
                                id="new"
                                name="new"
                                type="checkbox"
                                checked={formValues.new}
                                onChange={handleChange}
                            />
                            <span>Producto nuevo</span>
                        </label>
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

            <div className={styles.productsList}>
                {products.map((p) => {
                    const isExpanded = expandedProducts.has(p.id);
                    return (
                        <div key={p.id} className={styles.productItem}>
                            <div
                                className={styles.productHeader}
                                onClick={() => toggleProduct(p.id)}
                            >
                                <div className={styles.productHeaderContent}>
                                    <span className={styles.productName}>{p.name}</span>
                                    <span className={styles.productId}>ID: {p.id}</span>
                                </div>
                                <span className={styles.expandIcon}>
                                    {isExpanded ? "−" : "+"}
                                </span>
                            </div>
                            {isExpanded && (
                                <div className={styles.productDetails}>
                                    <div className={styles.actionsSection}>
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
                                    </div>

                                    <div className={styles.detailsGrid}>
                                        <div className={styles.detailSection}>
                                            <h3 className={styles.sectionTitle}>Información Básica</h3>
                                            <div className={styles.detailRow}>
                                                <span className={styles.detailLabel}>Descripción:</span>
                                                <span className={styles.detailValue}>{p.description}</span>
                                            </div>
                                            <div className={styles.detailRow}>
                                                <span className={styles.detailLabel}>Descripción Técnica:</span>
                                                <span className={styles.detailValue}>{p.technicalDescription}</span>
                                            </div>
                                            <div className={styles.detailRow}>
                                                <span className={styles.detailLabel}>Precio:</span>
                                                <span className={styles.detailValue}>${p.price}</span>
                                            </div>
                                            <div className={styles.detailRow}>
                                                <span className={styles.detailLabel}>Categoría:</span>
                                                <span className={styles.detailValue}>{p.category || "N/A"}</span>
                                            </div>
                                            <div className={styles.detailRow}>
                                                <span className={styles.detailLabel}>Producto Nuevo:</span>
                                                <span className={styles.detailValue}>{p.new ? "✓ Sí" : "✗ No"}</span>
                                            </div>
                                        </div>

                                        <div className={styles.detailSection}>
                                            <h3 className={styles.sectionTitle}>Detalles del Producto</h3>
                                            <div className={styles.detailRow}>
                                                <span className={styles.detailLabel}>Colección:</span>
                                                <span className={styles.detailValue}>{p.collection}</span>
                                            </div>
                                            <div className={styles.detailRow}>
                                                <span className={styles.detailLabel}>Color:</span>
                                                <span className={styles.detailValue}>{p.color}</span>
                                            </div>
                                            <div className={styles.detailRow}>
                                                <span className={styles.detailLabel}>Material:</span>
                                                <span className={styles.detailValue}>{p.material}</span>
                                            </div>
                                        </div>

                                        <div className={styles.detailSection}>
                                            <h3 className={styles.sectionTitle}>Stock por Talle</h3>
                                            <div className={styles.detailRow}>
                                                <span className={styles.detailLabel}>Talle 1:</span>
                                                <span className={styles.detailValue}>{p.stock1 ?? 0}</span>
                                            </div>
                                            <div className={styles.detailRow}>
                                                <span className={styles.detailLabel}>Talle 2:</span>
                                                <span className={styles.detailValue}>{p.stock2 ?? 0}</span>
                                            </div>
                                            <div className={styles.detailRow}>
                                                <span className={styles.detailLabel}>Talle 3:</span>
                                                <span className={styles.detailValue}>{p.stock3 ?? 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {(p.images && p.images.length > 0) || p.video ? (
                                        <div className={styles.mediaContainer}>
                                            {p.images && p.images.length > 0 && (
                                                <div className={styles.imagesSection}>
                                                    <h3 className={styles.sectionTitle}>Imágenes</h3>
                                                    <div className={styles.imagesGrid}>
                                                        {p.images.map((url, i) => (
                                                            <img
                                                                key={i}
                                                                src={url}
                                                                alt={`Producto ${p.name} #${i + 1}`}
                                                                className={styles.productImage}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {p.video && (
                                                <div className={styles.videoSection}>
                                                    <h3 className={styles.sectionTitle}>Video</h3>
                                                    <video
                                                        src={p.video}
                                                        controls
                                                        className={styles.productVideo}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {products.length === 0 && (
                <div className={styles.emptyMessage}>No hay productos para mostrar</div>
            )}
        </div>
    );
}
