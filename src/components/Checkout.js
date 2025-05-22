// src/components/Checkout.js
"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "../contexts/CartContext";
import { orderService } from "../services/orderService";
import toast, { Toaster } from "react-hot-toast"; // Toast library
import styles from "../styles/Checkout.module.css";

import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import { createPreference } from "../utils/mercadopagoService";

// Initialize MercadoPago SDK with your public key
// initMercadoPago("APP_USR-bf88a3d1-a7f7-464a-a299-5b95e4c6a656");
initMercadoPago("APP_USR-07f67e31-9b52-4c1e-8d5c-dad4d0c14bc2");


export default function Checkout({ onBack }) {
    // Retrieve cart items and clearCart method
    const { items, clearCart } = useCart();

    // Form data state
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
    // Form validation errors
    const [errors, setErrors] = useState({});
    // Submission loading state
    const [isSending, setIsSending] = useState(false);

    // MercadoPago preference loading/error state
    const [loadingMp, setLoadingMp] = useState(false);
    const [mpError, setMpError] = useState(null);
    // MercadoPago preference ID
    const [preferenceId, setPreferenceId] = useState(null);

    // Check if all required fields (except observations) are filled
    const isFormValid = Object.keys(formData)
        .filter((key) => key !== "observations")
        .every((key) => formData[key].trim() !== "");

    // Fetch MercadoPago preference whenever cart items change
    useEffect(() => {
        async function fetchPreference() {
            setLoadingMp(true);
            setMpError(null);
            try {
                // Map cart items to MercadoPago item format
                const mpItems = items.map((item) => ({
                    title: item.name,
                    quantity: item.quantity,
                    unit_price: item.price,
                }));
                // Create preference via backend util
                const id = await createPreference(mpItems);
                setPreferenceId(id);
                console.debug("MP preference created:", id);
            } catch (error) {
                console.error("MP preference error:", error);
                setMpError(error.message);
            } finally {
                setLoadingMp(false);
            }
        }

        if (items.length > 0) {
            fetchPreference();
        }
    }, [items]);

    // Generic input change handler
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Save order, send emails and clear cart
    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();

        // Reset errors
        setErrors({});
        // Validate required fields
        const newErrors = {};
        Object.entries(formData).forEach(([key, value]) => {
            if (key !== "observations" && !value.trim()) {
                newErrors[key] = "Este campo es obligatorio";
            }
        });
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSending(true);
        const toastId = toast.loading("Enviando pedido...");

        try {
            // Calculate total amount
            const total = items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );

            // Build order payload
            const orderPayload = { customer: formData, items, total };

            // Save order to backend
            const orderId = await orderService.addOrder(orderPayload);
            console.debug("Order saved with ID:", orderId);

            // Send confirmation emails
            let emailResp;
            try {
                emailResp = await fetch("/api/send-order-mail", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orderId, ...orderPayload }),
                });
            } catch (networkErr) {
                console.error("Network error sending order emails:", networkErr);
                toast.error(
                    "No se pudo conectar con el servidor. Por favor, revisá tu conexión y volvé a intentar.",
                    { id: toastId }
                );
                setIsSending(false);
                return;
            }

            if (!emailResp.ok) {
                const errorText = await emailResp.text();
                console.error("Failed to send order emails:", errorText);
                toast.error(
                    `Hubo un problema al enviar los correos (${emailResp.status}).`,
                    { id: toastId }
                );
                setIsSending(false);
                return;
            }

            // Success: notify user and clear cart
            toast.success(`Pedido enviado con éxito. ID: ${orderId}`, { id: toastId });
            clearCart();
            onBack();
        } catch (err) {
            console.error("Error processing order:", err);
            toast.error("Ocurrió un error al procesar el pedido.", { id: toastId });
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
            <Toaster /> {/* Toast notifications */}

            <h2>Finalizar Compra</h2>

            <form className={styles.form} onSubmit={handleSubmit}>
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

                {/* Teléfono */}
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
                                <th>Precio</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td>{item.quantity}</td>
                                    <td>${item.price}</td>
                                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p>Total: ${total.toFixed(2)}</p>
                </div>

                {/* Botones de acción */}
                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        marginTop: "12px",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    {/* MercadoPago Wallet */}
                    <div>
                        {loadingMp && <p>Cargando pago...</p>}
                        {mpError && <p>Error al generar el pago: {mpError}</p>}
                        {!loadingMp && preferenceId && (
                            <>
                                {isFormValid ? (
                                    // On click, call handleSubmit to send mail before payment
                                    <div style={{ width: "300px" }} onClick={handleSubmit}>
                                        <Wallet
                                            initialization={{ preferenceId }}
                                        />
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        className={styles.button}
                                        disabled
                                        style={{ cursor: "not-allowed", color: "black" }}
                                    >
                                        Complete todos los campos para pagar
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    {/* Botón Volver */}
                    <button
                        type="button"
                        className={styles.button}
                        onClick={onBack}
                        disabled={isSending}
                    >
                        Volver al carrito
                    </button>
                </div>
            </form>
        </div>
    );
}