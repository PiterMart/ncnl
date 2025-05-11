// src/components/Checkout.js
"use client";

import React, { useState } from "react";
import { useCart } from "../contexts/CartContext";
import { orderService } from "../services/orderService";
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

            // 3) Send emails via new API route
            const emailResp = await fetch("/api/send-order-mail", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, ...orderPayload }),
            });
            if (!emailResp.ok) {
                console.error("Failed to send order emails:", await emailResp.text());
                alert(
                    `Pedido ${orderId} guardado, pero ocurrió un error al enviar los correos.`
                );
            } else {
                alert(`Pedido enviado con éxito. ID: ${orderId}`);
            }

            // 4) Clear cart and return to cart view
            clearCart();
            onBack();
        } catch (error) {
            console.error("Error processing order:", error);
            alert("Ocurrió un error al procesar el pedido.");
        }
    };

    // Calculate total for display
    const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return (
        <div className={styles.container}>
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
                    <button type="button" className={styles.button} onClick={onBack}>
                        Volver al carrito
                    </button>
                    {/* Enviar Pedido */}
                    <button type="submit" className={styles.button}>
                        Enviar Pedido
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
