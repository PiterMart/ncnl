// src/components/Checkout.js
"use client";

import React, { useState } from "react";
import { useCart } from "../contexts/CartContext";
import { orderService } from "../services/orderService";
import toast, { Toaster } from "react-hot-toast"; // Toast library
import styles from "../styles/Checkout.module.css";

/**
 * Checkout component
 * @param {{ onBack: () => void }} props
 */
export default function Checkout({ onBack }) {
    const { items, clearCart } = useCart();

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
    const [isSending, setIsSending] = useState(false); // Disable submit button flag

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields (except observations)
        const newErrors = {};
        Object.entries(formData).forEach(([key, value]) => {
            if (!value && key !== "observations") {
                newErrors[key] = "Este campo es obligatorio";
            }
        });
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSending(true);
        const toastId = toast.loading("Enviando pedido..."); // Show loading toast

        try {
            // 1) Calculate total amount
            const total = items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );

            // 2) Save order to Firestore
            const orderPayload = { customer: formData, items, total };
            const orderId = await orderService.addOrder(orderPayload);
            console.debug("Order saved with ID:", orderId);

            let emailResp;
            try {
                // 3) Send emails via API route
                emailResp = await fetch("/api/send-order-mail", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ orderId, ...orderPayload }),
                });
            } catch (networkErr) {
                // Network error (no response)
                console.error("Network error sending order emails:", networkErr);
                toast.error(
                    "No se pudo conectar con el servidor. Por favor, revisá tu conexión y volvé a intentar.",
                    { id: toastId }
                );
                setIsSending(false);
                return;
            }

            if (!emailResp.ok) {
                // Server responded with error status
                const errorText = await emailResp.text();
                console.error("Failed to send order emails:", errorText);
                toast.error(
                    `Hubo un problema al enviar los correos (${emailResp.status}).`,
                    { id: toastId }
                );
                setIsSending(false);
                return;
            }

            // Success
            toast.success(`Pedido enviado con éxito. ID: ${orderId}`, { id: toastId });
            clearCart();   // Clear cart on success
            onBack();      // Go back to cart view
        } catch (err) {
            // Unexpected error in processing order
            console.error("Error processing order:", err);
            toast.error("Ocurrió un error al procesar el pedido.", { id: toastId });
            setIsSending(false);
        }
    };

    // Calculate total for display
    const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return (
        <div className={styles.container}>
            {/* Toast container */}
            <Toaster/>

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
                    {errors.address && (
                        <span className={styles.error}>{errors.address}</span>
                    )}
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
                    {errors.province && (
                        <span className={styles.error}>{errors.province}</span>
                    )}
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
                    {errors.country && (
                        <span className={styles.error}>{errors.country}</span>
                    )}
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
                    {errors.postalCode && (
                        <span className={styles.error}>{errors.postalCode}</span>
                    )}
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

                <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                    {/* Volver al carrito */}
                    <button
                        type="button"
                        className={styles.button}
                        onClick={onBack}
                        disabled={isSending} // also disable back while sending
                    >
                        Volver al carrito
                    </button>
                    {/* Enviar Pedido */}
                    <button
                        type="submit"
                        className={styles.button}
                        disabled={isSending} // Disable while sending
                    >
                        {isSending ? "Enviando..." : "Enviar Pedido"}
                    </button>
                </div>
            </form>

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
        </div>
    );
}
