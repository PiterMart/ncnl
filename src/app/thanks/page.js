// src/app/thanks/page.jsx (o /pages/thanks.js en Next 12/13)

"use client";

import { useEffect } from "react";
import { useCart } from "../../contexts/CartContext";
import { useRouter } from "next/navigation"; // o "next/router" en versiones viejas

export default function ThanksPage() {
    const { clearCart } = useCart();
    const router = useRouter();

    useEffect(() => {
        clearCart(); // Limpiar carrito al llegar a esta página

        // Opcional: redirigir a inicio tras unos segundos
        const timeout = setTimeout(() => {
            router.push("/");
        }, 5000);

        return () => clearTimeout(timeout);
    }, []);

    return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
            <h1>¡Gracias por tu compra!</h1>
            <p>Tu pedido fue procesado correctamente.</p>
            <p>Serás redirigido al inicio en unos segundos...</p>
        </div>
    );
}