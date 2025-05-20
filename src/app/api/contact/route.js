// pages/api/contact.js
import { adminDb, FieldValue } from "@/firebase/firebaseAdmin";
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(request) {
    try {
        // 1) parse incoming JSON
        const { firstName, lastName, email, birthdate } = await request.json();

        // 2) check for existing lead
        const leadsRef = adminDb.collection("leads");
        const snapshot = await leadsRef.where("email", "==", email).get();
        if (!snapshot.empty) {
            return new Response(
                JSON.stringify({ message: "Lead already exists" }),
                { status: 409 }
            );
        }

        // 3) generate unique token
        const accountToken = crypto.randomBytes(32).toString("hex");

        // 4) prepare data object
        const leadData = {
            email,
            name: `${firstName} ${lastName}`,
            birthdate,
            accountToken,
            createdAt: FieldValue.serverTimestamp(),
            hasAccount: false,
            status: "new",
            accountEmailSent: false,
        };

        // 5) save with Admin SDK (bypasses client rules)
        const leadRef = await leadsRef.add(leadData);

        // 6) email setup
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        // 7) send confirmation email
        await transporter.sendMail({
            from: `"NCNL" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "NCNL",
            html: `
        <img
          src="https://firebasestorage.googleapis.com/v0/b/ncnl-9fd04.firebasestorage.app/o/logo%2FNCNL_LOGO%402x.png?alt=media"
          alt="NCNL logo"
          style="max-width: 100%; margin-bottom: 20px;"
        />
        <h1>Gracias por sumarte!</h1>
        <p>Pronto te enviaremos más novedades.</p>
        <p>Saludos,<br>NCNL</p>
      `,
        });

        // 8) return success
        return new Response(
            JSON.stringify({
                message: "Contact form submitted successfully",
                leadId: leadRef.id,
            }),
            { status: 200 }
        );
    } catch (error) {
        // no silent errors
        console.error("API /contact error:", error);
        return new Response(
            JSON.stringify({
                message: "Failed to submit contact form",
                error: error.message,
            }),
            { status: 500 }
        );
    }
}
