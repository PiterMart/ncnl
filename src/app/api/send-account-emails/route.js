import { NextResponse } from 'next/server';
import { db } from '../../../../firebase/firebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { sendEmail } from '../../../../src/utils/emailService';

export async function POST(request) {
  try {
    const { leadIds } = await request.json();

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid lead IDs' },
        { status: 400 }
      );
    }

    const results = [];

    for (const leadId of leadIds) {
      try {
        // Get the lead data
        const leadRef = doc(db, 'leads', leadId);
        const leadDoc = await getDoc(leadRef);
        
        if (!leadDoc.exists()) {
          results.push({ leadId, status: 'error', message: 'Lead not found' });
          continue;
        }

        const leadData = leadDoc.data();

        // Skip if email was already sent
        if (leadData.accountEmailSent) {
          results.push({ leadId, status: 'skipped', message: 'Email already sent' });
          continue;
        }

        // Skip if no token
        if (!leadData.accountToken) {
          results.push({ leadId, status: 'error', message: 'No account token found' });
          continue;
        }

        // Send the email using the existing email service
        await sendEmail({
          to: leadData.email,
          subject: 'Create Your NCNL Account',
          html: `
            <h1>Welcome to NCNL!</h1>
            <p>Hello ${leadData.name},</p>
            <p>Click the link below to create your account:</p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/create-account?token=${leadData.accountToken}">
              Create Account
            </a>
            <p>This link will expire in 24 hours.</p>
          `
        });

        // Update lead document
        await updateDoc(leadRef, {
          accountEmailSent: true,
          status: 'pending',
          emailSentAt: new Date()
        });

        results.push({ leadId, status: 'success', message: 'Email sent successfully' });
      } catch (error) {
        console.error(`Error processing lead ${leadId}:`, error);
        results.push({ leadId, status: 'error', message: error.message });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error sending account emails:', error);
    return NextResponse.json(
      { error: 'Failed to send account emails' },
      { status: 500 }
    );
  }
} 