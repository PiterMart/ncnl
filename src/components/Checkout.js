// src/components/Checkout.js
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCart } from "../contexts/CartContext";
import toast, { Toaster } from "react-hot-toast";
import styles from "../styles/Checkout.module.css";

import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import { createPreference } from "../utils/mercadopagoService";
import { orderService } from "../services/orderService";

// Initialize MercadoPago SDK with your public key
initMercadoPago("APP_USR-07f67e31-9b52-4c1e-8d5c-dad4d0c14bc2");

export default function Checkout({ onBack }) {
    const { items } = useCart();

    // Form state
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
    const [errors, setErrors] = useState({});
    const [isSending, setIsSending] = useState(false);
    const [preferenceId, setPreferenceId] = useState(null);

    // Ref to ensure preparePayment runs only once
    const hasPreparedRef = useRef(false);

    // Check if all required fields (except observations) are filled
    const isFormValid = Object.keys(formData)
        .filter((key) => key !== "observations")
        .every((key) => formData[key].trim() !== "");

    // Trigger payment preparation exactly once when form becomes valid
    useEffect(() => {
        if (isFormValid && !preferenceId && !isSending && !hasPreparedRef.current) {
            hasPreparedRef.current = true;
            handlePreparePayment();
        }
    }, [isFormValid, preferenceId, isSending]);

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Prepare MercadoPago preference and create pending order
    const handlePreparePayment = async () => {
        // prevent duplicate calls
        if (isSending) return;

        setErrors({});
        setIsSending(true);

        try {
            // Validate required fields
            const validationErrors = {};
            Object.entries(formData).forEach(([key, value]) => {
                if (key !== "observations" && !value.trim()) {
                    validationErrors[key] = "Este campo es obligatorio";
                }
            });
            if (Object.keys(validationErrors).length) {
                setErrors(validationErrors);
                setIsSending(false);
                return;
            }

            // Calculate total
            const total = items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );

            // Clean undefined fields before sending
            const cleanedCustomer = Object.fromEntries(
                Object.entries(formData).filter(([_, v]) => v !== undefined)
            );
            const cleanedItems = items.map((item) =>
                Object.fromEntries(Object.entries(item).filter(([_, v]) => v !== undefined))
            );

            // Create pending order in Firestore
            try {
                const orderId = await orderService.addOrder({
                    customer: cleanedCustomer,
                    items: cleanedItems,
                    total,
                    status: "pending",
                });
                console.debug("Pending order created with ID:", orderId);
                sessionStorage.setItem(
                    "pendingOrder",
                    JSON.stringify({ orderId, customer: cleanedCustomer, items: cleanedItems, total })
                );
            } catch (err) {
                console.error("Error creating pending order:", err);
                toast.error("No se pudo guardar la orden pendiente.");
            }

            // Build MercadoPago items payload
            const mpItems = items.map((item) => ({
                title: item.name,
                quantity: Number(item.quantity),
                unit_price: Number(item.price),
            }));

            const origin = window.location.origin;
            const back_urls = {
                success: `${origin}/thanks`,
                failure: `${origin}/checkout`,
                pending: `${origin}/checkout`,
            };

            const preferencePayload = {
                items: mpItems,
                back_urls,
                auto_return: "approved",
            };

            console.debug("Preference payload:", preferencePayload);
            const mpId = await createPreference(preferencePayload);
            setPreferenceId(mpId);
        } catch (error) {
            console.error("Error creating preference:", error);
            toast.error("No se pudo iniciar el pago.");
        } finally {
            setIsSending(false);
        }
    };

    // Compute total for display
    const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return (
        <div className={styles.container}>
            <Toaster />

            <p className={styles.title}>Finalizar Compra</p>

            <form className={styles.form}>
                {/* Nombre */}
                <label className={styles.label}>
                    Nombre:
                    <input
                        className={styles.input}
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                    />
                    {errors.name && <span className={styles.error}>{errors.name}</span>}
                </label>

                {/* Correo electrónico */}
                <label className={styles.label}>
                    Correo electrónico:
                    <input
                        className={styles.input}
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    {errors.email && <span className={styles.error}>{errors.email}</span>}
                </label>

                {/* Número de celular */}
                <label className={styles.label}>
                    Número de celular:
                    <input
                        className={styles.input}
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                    {errors.phone && <span className={styles.error}>{errors.phone}</span>}
                </label>

                {/* DNI */}
                <label className={styles.label}>
                    DNI:
                    <input
                        className={styles.input}
                        type="text"
                        name="dni"
                        value={formData.dni}
                        onChange={handleChange}
                    />
                    {errors.dni && <span className={styles.error}>{errors.dni}</span>}
                </label>

                {/* Dirección */}
                <label className={styles.label}>
                    Dirección:
                    <input
                        className={styles.input}
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                    />
                    {errors.address && <span className={styles.error}>{errors.address}</span>}
                </label>

                {/* Provincia */}
                <label className={styles.label}>
                    Provincia:
                    <input
                        className={styles.input}
                        type="text"
                        name="province"
                        value={formData.province}
                        onChange={handleChange}
                    />
                    {errors.province && <span className={styles.error}>{errors.province}</span>}
                </label>

                {/* Ciudad */}
                <label className={styles.label}>
                    Ciudad:
                    <input
                        className={styles.input}
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                    />
                    {errors.city && <span className={styles.error}>{errors.city}</span>}
                </label>

                {/* País */}
                <label className={styles.label}>
                    País:
                    <input
                        className={styles.input}
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                    />
                    {errors.country && <span className={styles.error}>{errors.country}</span>}
                </label>

                {/* Código Postal */}
                <label className={styles.label}>
                    Código Postal:
                    <input
                        className={styles.input}
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                    />
                    {errors.postalCode && <span className={styles.error}>{errors.postalCode}</span>}
                </label>

                {/* Observaciones */}
                <label className={styles.label}>
                    Observaciones:
                    <textarea
                        className={styles.textarea}
                        name="observations"
                        value={formData.observations}
                        onChange={handleChange}
                    />
                </label>

                {/* Resumen del pedido */}
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
            </form>

            <div
                style={{
                    marginTop: 20,
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                {preferenceId ? (
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
                ) : (
                    <button className={styles.button} disabled>
                        Completa los campos para pagar
                    </button>
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
