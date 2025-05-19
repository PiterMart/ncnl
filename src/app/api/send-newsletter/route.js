// Example for app/api/send-newsletter/route.js
import { NextResponse } from 'next/server';
import { db } from '../../../firebase/firebaseConfig'; // Adjust path as needed
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore'; // Ensure doc is imported for updateDoc
import { sendEmail } from '../../../utils/emailService'; // Adjust path as needed

export async function POST(request) {
  try {
    const {
      subject,
      headline,
      body,
      imageUrl,
      buttonText,
      buttonLink,
      recipients = [],
      // recipientType, // No longer strictly needed from the client if always 'leads'
    } = await request.json();

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'No recipients provided' },
        { status: 400 }
      );
    }

    // Save newsletter to Firestore
    const newsletterRef = await addDoc(collection(db, 'newsletters'), {
      subject,
      headline,
      body,
      imageUrl,
      buttonText,
      buttonLink,
      recipients, // These are now always lead emails
      recipientType: 'leads', // Hardcode or remove if not needed for querying/analytics
      sentAt: new Date(),
      status: 'pending'
    });

    const results = [];

    for (const recipient of recipients) {
      try {
        await sendEmail({
          to: recipient,
          subject,
          html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
              <h1 style="color: #333; margin-bottom: 20px;">${headline}</h1>
              ${imageUrl ? `<img src="${imageUrl}" alt="Newsletter Image" style="max-width: 100%; margin-bottom: 20px;" />` : ''}
              <div style="margin-bottom: 20px;">${body}</div>
              ${
                buttonText && buttonLink
                  ? `<a href="${buttonLink}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 4px;">${buttonText}</a>`
                  : ''
              }
            </div>
          `
        });
        results.push({ email: recipient, status: 'success' });
      } catch (error) {
        console.error(`Error sending to ${recipient}:`, error);
        results.push({ email: recipient, status: 'error', error: error.message });
      }
    }

    // Update newsletter status and results
    // Make sure you're using the correct reference for updateDoc: doc(db, 'collectionName', documentId)
    await updateDoc(doc(db, 'newsletters', newsletterRef.id), {
      status: 'sent',
      results
    });

    return NextResponse.json({
      success: true,
      message: 'Newsletter sent successfully to leads',
      results
    });

  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json(
      { error: 'Failed to send newsletter' },
      { status: 500 }
    );
  }
}