// src/components/Checkout.js
"use client";

import React, { useState } from "react";
import { useCart } from "../contexts/CartContext";
import toast, { Toaster } from "react-hot-toast";
import styles from "../styles/Checkout.module.css";

import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import { createPreference } from "../utils/mercadopagoService";
import { redirect } from "next/navigation";

// Initialize MercadoPago SDK with your public key
initMercadoPago("APP_USR-07f67e31-9b52-4c1e-8d5c-dad4d0c14bc2");

export default function Checkout({ onBack }) {
    // Retrieve cart items
    const { items } = useCart();

    // Form input state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        dni: "",
        address: "",
        province: "",
        city: "",
        country: "",
        postalCode: "",
        observations: "",
    });

    // Validation errors state
    const [errors, setErrors] = useState({});

    // Prevent double submissions
    const [isSending, setIsSending] = useState(false);

    // MercadoPago preference ID
    const [preferenceId, setPreferenceId] = useState(null);

    // Check if all required fields (except observations) are filled
    const isFormValid = Object.keys(formData)
        .filter((key) => key !== "observations")
        .every((key) => formData[key].trim() !== "");

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle form submission: validate, store pending order, create MP preference
    const handleSubmit = async (e) => {
        if (e?.preventDefault) e.preventDefault();
        if (isSending) return;

        // Reset errors
        setErrors({});
        const validationErrors = {};

        // Validate required fields
        Object.entries(formData).forEach(([key, value]) => {
            if (key !== "observations" && !value.trim()) {
                validationErrors[key] = "Este campo es obligatorio";
            }
        });

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSending(true);
        const toastId = toast.loading("Preparando pago...");

        try {
            // Calculate total amount
            const total = items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );

            // Clean undefined properties
            const cleanedCustomer = Object.fromEntries(
                Object.entries(formData).filter(([_, v]) => v !== undefined)
            );
            const cleanedItems = items.map((item) =>
                Object.fromEntries(Object.entries(item).filter(([_, v]) => v !== undefined))
            );

            // Pending order payload for sessionStorage
            const orderPayload = {
                customer: cleanedCustomer,
                items: cleanedItems,
                total,
            };

            // Store pending order to finalize after payment
            sessionStorage.setItem(
                "pendingOrder",
                JSON.stringify(orderPayload)
            );

            // Prepare MercadoPago items
            const mpItems = items.map((item) => ({
                title: item.name,
                quantity: Number(item.quantity),
                unit_price: Number(item.price),
            }));

            // Define back URLs
            const origin = window.location.origin;
            const back_urls = {
                success: `${origin}/thanks`,
                failure: `${origin}/checkout`,
                pending: `${origin}/checkout`,
            };

            // Build preference with auto_return
            const preferencePayload = {
                items: mpItems,
                back_urls,
                auto_return: "approved",
            };

            console.debug("createPreference payload:", preferencePayload);

            // Create MercadoPago preference
            const mpId = await createPreference(preferencePayload);
            setPreferenceId(mpId);

            toast.success("Redirigiendo al pago...", { id: toastId });
        } catch (error) {
            console.error("Error creating preference:", error);
            toast.error("No se pudo iniciar el pago.", { id: toastId });
        } finally {
            setIsSending(false);
        }
    };

    // Compute order total for display
    const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return (
        <div className={styles.container}>
            <Toaster />

            <p className={styles.title}>Finalizar Compra</p>

            <form className={styles.form} onSubmit={handleSubmit}>
                <label className={styles.label}>
                    Nombre:
                    <input
                        className={styles.input}
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    {errors.name && (
                        <span className={styles.error}>{errors.name}</span>
                    )}
                </label>

                <label className={styles.label}>
                    Correo electrónico:
                    <input
                        className={styles.input}
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    {errors.email && (
                        <span className={styles.error}>{errors.email}</span>
                    )}
                </label>

                <label className={styles.label}>
                    Número de celular:
                    <input
                        className={styles.input}
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                    {errors.phone && (
                        <span className={styles.error}>{errors.phone}</span>
                    )}
                </label>

                <label className={styles.label}>
                    DNI:
                    <input
                        className={styles.input}
                        type="text"
                        name="dni"
                        value={formData.dni}
                        onChange={handleChange}
                    />
                    {errors.dni && (
                        <span className={styles.error}>{errors.dni}</span>
                    )}
                </label>

                <label className={styles.label}>
                    Dirección:
                    <input
                        className={styles.input}
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                    />
                    {errors.address && (
                        <span className={styles.error}>{errors.address}</span>
                    )}
                </label>

                <label className={styles.label}>
                    Provincia:
                    <input
                        className={styles.input}
                        type="text"
                        name="province"
                        value={formData.province}
                        onChange={handleChange}
                    />
                    {errors.province && (
                        <span className={styles.error}>{errors.province}</span>
                    )}
                </label>

                <label className={styles.label}>
                    Ciudad:
                    <input
                        className={styles.input}
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                    />
                    {errors.city && (
                        <span className={styles.error}>{errors.city}</span>
                    )}
                </label>

                <label className={styles.label}>
                    País:
                    <input
                        className={styles.input}
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                    />
                    {errors.country && (
                        <span className={styles.error}>{errors.country}</span>
                    )}
                </label>

                <label className={styles.label}>
                    Código Postal:
                    <input
                        className={styles.input}
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                    />
                    {errors.postalCode && (
                        <span className={styles.error}>{errors.postalCode}</span>
                    )}
                </label>

                <label className={styles.label}>
                    Observaciones:
                    <textarea
                        className={styles.textarea}
                        name="observations"
                        value={formData.observations}
                        onChange={handleChange}
                    />
                </label>

                <div className={styles.summary}>
                    <h3>Resumen del pedido</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td>{item.quantity}</td>
                                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p style={{ fontSize: "1.5rem", fontWeight: 600 }}>
                        Total: ${total.toFixed(2)}
                    </p>
                </div>

                {!preferenceId && (
                    <button
                        type="submit"
                        className={styles.button}
                        disabled={!isFormValid || isSending}
                    >
                        Confirmar pedido
                    </button>
                )}
            </form>

            <div style={{ marginTop: 20, textAlign: "center" }}>
                {preferenceId && (
                    <div style={{ width: 300, margin: "0 auto" }}>
                        <Wallet
                            initialization={{
                                preferenceId,
                                redirectMode: "self",
                            }}
                            onError={(err) =>
                                console.error("MP Wallet error:", err)
                            }
                            onReady={() =>
                                console.debug("MP Wallet ready")
                            }
                        />
                    </div>
                )}

                <button
                    type="button"
                    className={styles.button}
                    onClick={onBack}
                    disabled={isSending}
                >
                    Volver al carrito
                </button>
            </div>
        </div>
    );
}
