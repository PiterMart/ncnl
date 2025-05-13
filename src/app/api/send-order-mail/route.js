// src/app/api/send-order-mail/route.js

import { NextResponse } from "next/server";
import admin from "firebase-admin";
import { sendEmail } from "../../../utils/emailService";

// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            // Replace escaped newlines with actual newlines
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
    });
}

// Get Firestore instance from Admin SDK
const db = admin.firestore();

/**
 * Handle POST /api/send-order-mail
 * - Logs the email intent to Firestore
 * - Envía los mails al cliente y al interno
 * - Actualiza el log con el resultado
 */
export async function POST(request) {
    let emailLogRef = null;

    try {
        // Parse request body
        const { orderId, customer, items, total } = await request.json();

        // Define recipients: cliente + notificación interna
        const internalEmail = process.env.NOTIFY_EMAIL;
        if (!internalEmail) {
            throw new Error("Missing NOTIFY_EMAIL env var");
        }
        const recipients = [customer.email, internalEmail];

        // 1) Create initial log in Firestore
        emailLogRef = await db.collection("orderEmails").add({
            orderId,
            customer,
            items,
            total,
            recipients,
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            status: "pending",
        });

        const results = [];

        // 2) Send emails one by one
        for (const to of recipients) {
            try {
                // Build subject and HTML based on destinatario
                const isCustomer = to === customer.email;
                const subject = isCustomer
                    ? `Confirmación de pedido ${orderId}`
                    : `Notificación interna pedido ${orderId}`;

                // Generate email HTML
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
                    ].filter(Boolean).join(", ")}</p>
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
          `;

                // Send email via tu servicio
                await sendEmail({ to, subject, html });

                results.push({ email: to, status: "success" });
            } catch (mailErr) {
                console.error(`Error sending email to ${to}:`, mailErr);
                results.push({ email: to, status: "error", error: mailErr.message });
            }
        }

        // 3) Update the Firestore log with results
        await emailLogRef.update({
            status: "sent",
            results,
            finishedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ success: true, orderId, results });
    } catch (err) {
        console.error("send-order-mail error:", err);

        // If log was created, mark it as error
        if (emailLogRef) {
            try {
                await emailLogRef.update({
                    status: "error",
                    error: err.message,
                    finishedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
            } catch (uErr) {
                console.error("Error updating log after failure:", uErr);
            }
        }

        return NextResponse.json(
            { error: err.message || "Unknown error" },
            { status: 500 }
        );
    }
}
