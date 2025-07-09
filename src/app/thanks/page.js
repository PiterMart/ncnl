// src/app/thanks/page.jsx
"use client";

import React, { useEffect } from "react";
import { useCart } from "../../contexts/CartContext";
import { useRouter } from "next/navigation";
import { orderService } from "../../services/orderService";

export default function ThanksPage() {
    const { clearCart } = useCart();
    const router = useRouter();

    useEffect(() => {
        const pending = sessionStorage.getItem("pendingOrder");
        if (pending) {
            const { customer, items, total } = JSON.parse(pending);

            // Finalize order and send mails
            (async () => {
                try {
                    // Save order in Firestore
                    const orderId = await orderService.addOrder({ customer, items, total });
                    console.debug("Order saved with ID:", orderId);

                    // Send order emails
                    const resp = await fetch("/api/send-order-mail", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ orderId, customer, items, total }),
                    });
                    if (!resp.ok) {
                        const text = await resp.text();
                        console.error("Failed to send emails:", text);
                    }
                } catch (err) {
                    console.error("Error finalizing order:", err);
                } finally {
                    sessionStorage.removeItem("pendingOrder");
                    clearCart();
                    // Redirect home after 5s
                    setTimeout(() => router.push("/"), 5000);
                }
            })();
        } else {
            clearCart();
            setTimeout(() => router.push("/"), 5000);
        }
    }, []);

    return (
        <div style={{ padding: "2rem", textAlign: "center", marginTop: '15rem' }}>
            <h1>¡Gracias por tu compra!</h1>
            <p>Tu pedido fue procesado correctamente.</p>
            <p>Serás redirigido al inicio en unos segundos...</p>
        </div>
    );
}
