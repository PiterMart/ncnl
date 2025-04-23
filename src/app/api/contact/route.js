import { db } from "../../../../firebase/firebaseConfig";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(request) {
  try {
    const { firstName, lastName, email, birthdate } = await request.json();

    // Check if lead already exists
    const leadsRef = collection(db, "leads");
    const existingQuery = query(leadsRef, where("email", "==", email));
    const existingSnapshot = await getDocs(existingQuery);

    if (!existingSnapshot.empty) {
      return new Response(
        JSON.stringify({ message: "Lead already exists" }),
        { status: 409 }
      );
    }

    // Generate a unique token
    const accountToken = crypto.randomBytes(32).toString('hex');

    // Add new lead
    const leadDoc = await addDoc(leadsRef, {
      email,
      name: `${firstName} ${lastName}`,
      birthdate,
      accountToken,
      createdAt: new Date(),
      hasAccount: false,
      status: "new",
      accountEmailSent: false
    });

    // Email configuration
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // Send confirmation email
    await transporter.sendMail({
      from: `"NCNL" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "NCNL",
      html: `
        <img src="https://firebasestorage.googleapis.com/v0/b/ncnl-9fd04.firebasestorage.app/o/logo%2FNCNL_LOGO%402x.png?alt=media&token=b88eebb6-6972-4818-a351-7684a2bffcf69" alt="NCNL" style="max-width: 100%; margin-bottom: 20px;" />
        <h1>Gracias por sumarte!</h1>
        <p>Pronto te enviaremos mas novedades.</p>
        <p>Saludos,<br> NCNL ... </p>
      `
    });

    return new Response(
      JSON.stringify({ 
        message: "Contact form submitted successfully",
        leadId: leadDoc.id
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ message: "Failed to submit contact form" }),
      { status: 500 }
    );
  }
} 