// src/app/api/send-order-mail/route.js

import { NextResponse } from "next/server";
import { sendEmail } from "../../../utils/emailService";

export async function POST(request) {
    try {
        const { orderId, customer, items, total } = await request.json();

        const internalEmail = process.env.NOTIFY_EMAIL;
        if (!internalEmail) {
            throw new Error("Missing NOTIFY_EMAIL env var");
        }

        const recipients = [customer.email, internalEmail];

        // Log en consola en lugar de Firestore
        console.log("Enviando emails para pedido:", {
            orderId,
            to: recipients,
            timestamp: new Date().toISOString(),
        });

        const results = [];

        for (const to of recipients) {
            try {
                const isCustomer = to === customer.email;
                const subject = isCustomer
                    ? `Confirmación de pedido ${orderId}`
                    : `Notificación interna pedido ${orderId}`;

                const html = isCustomer
                    ? `
              <div style="font-family: Arial; max-width:600px; margin:auto;">
                <h1>Gracias por tu compra, ${customer.name}!</h1>
                <p>Tu pedido <strong>${orderId}</strong> ha sido procesado:</p>
                <ul>
                  ${items
                        .map(
                            (i) =>
                                `<li>${i.name} x${i.quantity} — $${(
                                    i.price * i.quantity
                                ).toFixed(2)}</li>`
                        )
                        .join("")}
                </ul>
                <p><strong>Total: $${total.toFixed(2)}</strong></p>
              </div>
            `
                    : `
              <div style="font-family: Arial; max-width:600px; margin:auto;">
                <h1>Nuevo pedido: ${orderId}</h1>
                <p><strong>Cliente:</strong> ${customer.name}</p>
                <p><strong>Email:</strong> ${customer.email}</p>
                <p><strong>Tel:</strong> ${customer.phone}</p>
                <p><strong>Dirección:</strong> ${[
                        customer.address,
                        customer.city,
                        customer.province,
                        customer.country,
                        "CP " + customer.postalCode,
                    ]
                        .filter(Boolean)
                        .join(", ")}</p>
                <ul>
                  ${items
                        .map(
                            (i) =>
                                `<li>${i.name} x${i.quantity} — $${(
                                    i.price * i.quantity
                                ).toFixed(2)}</li>`
                        )
                        .join("")}
                </ul>
                <p><strong>Total: $${total.toFixed(2)}</strong></p>
                <br>
                <p>NCNL se pondrá en contacto contigo en la brevedad para coordinar la entrega de tu pedido</p>
              </div>
            `;

                await sendEmail({ to, subject, html });

                results.push({ email: to, status: "success" });
            } catch (mailErr) {
                console.error(`Error sending email to ${to}:`, mailErr);
                results.push({ email: to, status: "error", error: mailErr.message });
            }
        }

        return NextResponse.json({ success: true, orderId, results });
    } catch (err) {
        console.error("send-order-mail error:", err);
        return NextResponse.json(
            { error: err.message || "Unknown error" },
            { status: 500 }
        );
    }
}
