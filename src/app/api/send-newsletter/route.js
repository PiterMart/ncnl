import { NextResponse } from 'next/server';
import { db, storage } from '../../../firebase/firebaseConfig';
import { collection, addDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { sendEmail } from '../../../utils/emailService';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  try {
    const { subject, headline, body, imageUrl, buttonText, buttonLink, recipients, recipientType } = await request.json();

    // Store newsletter in Firestore
    const newsletterRef = await addDoc(collection(db, 'newsletters'), {
      subject,
      headline,
      body,
      imageUrl,
      buttonText,
      buttonLink,
      recipients,
      recipientType,
      sentAt: new Date(),
      status: 'pending'
    });

    // Send emails to all recipients
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
              ${buttonText && buttonLink ? `
                <a href="${buttonLink}" 
                   style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 4px;">
                  ${buttonText}
                </a>
              ` : ''}
            </div>
          `
        });
        results.push({ email: recipient, status: 'success' });
      } catch (error) {
        console.error(`Error sending email to ${recipient}:`, error);
        results.push({ email: recipient, status: 'error', error: error.message });
      }
    }

    // Update newsletter status
    await updateDoc(newsletterRef, {
      status: 'sent',
      results
    });

    return NextResponse.json({ 
      success: true,
      message: 'Newsletter sent successfully',
      results
    });
  } catch (error) {
    console.error('Error sending newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to send newsletter' },
      { status: 500 }
    );
  }
} 