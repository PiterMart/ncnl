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
            const { orderId, customer, items, total } = JSON.parse(pending);

            (async () => {
                try {
                    // Update order status to paid
                    await orderService.updateOrderStatus(orderId, "paid");
                    console.debug("Order status updated to paid:", orderId);

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
                    console.error("Error finalizando orden:", err);
                } finally {
                    sessionStorage.removeItem("pendingOrder");
                    clearCart();
                    setTimeout(() => router.push("/"), 5000);
                }
            })();
        } else {
            clearCart();
            setTimeout(() => router.push("/"), 5000);
        }
    }, []);

    return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
            <h1>¡Gracias por tu compra!</h1>
            <p>Tu pedido fue procesado correctamente.</p>
            <p>Serás redirigido al inicio en unos segundos...</p>
        </div>
    );
}
