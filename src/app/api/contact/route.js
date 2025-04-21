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
      subject: "Thank you for contacting us",
      html: `
        <h1>Thank you for contacting NCNL!</h1>
        <p>We have received your message and will get back to you soon.</p>
        <p>Best regards,<br>The NCNL Team</p>
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