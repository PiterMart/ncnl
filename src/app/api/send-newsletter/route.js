import { NextResponse } from 'next/server';
import { db } from '../../../firebase/firebaseConfig'; // Adjust path as needed
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore'; // Added 'doc'
import { sendEmail } from '../../../utils/emailService'; // Adjust path as needed

// Configuration for batch sending
const EMAIL_BATCH_SIZE = 40; // Number of emails to send in one batch (Gmail free tier is around 100-500 per 24h, Workspace ~2000/day. Be conservative.)
const DELAY_BETWEEN_BATCHES_MS = 60000 * 2; // 2 minutes delay between batches (e.g., 60000ms = 1 minute)

// Helper function to introduce a delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request) {
  try {
    // `recipientType` is no longer expected. We only get `recipients` (which are all leads' emails).
    const { subject, headline, body, imageUrl, buttonText, buttonLink, recipients } = await request.json();

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: 'No recipients provided or recipients list is invalid.' },
        { status: 400 }
      );
    }

    // Initial record in Firestore
    const newsletterDocRef = await addDoc(collection(db, 'newsletters'), {
      subject,
      headline,
      body,
      imageUrl,
      buttonText,
      buttonLink,
      totalRecipients: recipients.length,
      processedRecipients: 0,
      successfulSends: 0,
      failedSends: 0,
      status: 'pending_batching', // New status
      createdAt: new Date(),
      batches: [], // To store info about each batch
    });

    // Start batch processing asynchronously. DO NOT await this call here.
    // This allows the API to respond quickly to the client.
    processBatches(newsletterDocRef.id, { subject, headline, body, imageUrl, buttonText, buttonLink }, recipients);

    return NextResponse.json({
      success: true,
      message: `Newsletter batch processing initiated for ${recipients.length} recipients. Monitor database for progress.`,
      newsletterId: newsletterDocRef.id
    });

  } catch (error) {
    console.error('Error initiating newsletter sending:', error);
    return NextResponse.json(
      { error: 'Failed to initiate newsletter sending process.' },
      { status: 500 }
    );
  }
}

// This function runs in the background (as much as serverless allows)
async function processBatches(newsletterId, emailContent, allRecipients) {
  const newsletterRef = doc(db, 'newsletters', newsletterId);
  let processedCount = 0;
  let successCount = 0;
  let failCount = 0;
  const batchDetails = [];

  await updateDoc(newsletterRef, { status: 'processing_batches' });

  for (let i = 0; i < allRecipients.length; i += EMAIL_BATCH_SIZE) {
    const batchNumber = (i / EMAIL_BATCH_SIZE) + 1;
    const currentBatchRecipients = allRecipients.slice(i, i + EMAIL_BATCH_SIZE);
    const batchStartTime = new Date();
    let batchSuccessCount = 0;
    let batchFailCount = 0;
    const batchRecipientResults = [];


    console.log(`Newsletter ${newsletterId}: Processing batch ${batchNumber} with ${currentBatchRecipients.length} emails.`);

    for (const recipient of currentBatchRecipients) {
      try {
        await sendEmail({
          to: recipient,
          subject: emailContent.subject,
          html: `
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
              <h1 style="color: #333; margin-bottom: 20px;">${emailContent.headline}</h1>
              ${emailContent.imageUrl ? `<img src="${emailContent.imageUrl}" alt="Newsletter Image" style="max-width: 100%; margin-bottom: 20px;" />` : ''}
              <div style="margin-bottom: 20px;">${emailContent.body}</div>
              ${emailContent.buttonText && emailContent.buttonLink ? `
                <a href="${emailContent.buttonLink}"
                   style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 4px;">
                  ${emailContent.buttonText}
                </a>
              ` : ''}
            </div>
          `
        });
        successCount++;
        batchSuccessCount++;
        batchRecipientResults.push({ email: recipient, status: 'success', timestamp: new Date() });
      } catch (error) {
        console.error(`Newsletter ${newsletterId}: Error sending email to ${recipient} in batch ${batchNumber}:`, error);
        failCount++;
        batchFailCount++;
        batchRecipientResults.push({ email: recipient, status: 'error', error: error.message, timestamp: new Date() });
      }
      processedCount++;
    }

    const batchEndTime = new Date();
    batchDetails.push({
        batchNumber,
        recipientsInBatch: currentBatchRecipients.length,
        successful: batchSuccessCount,
        failed: batchFailCount,
        startTime: batchStartTime,
        endTime: batchEndTime,
        durationMs: batchEndTime - batchStartTime,
        recipientResults: batchRecipientResults // Detailed results per recipient in batch
    });

    // Update Firestore after each batch
    try {
      await updateDoc(newsletterRef, {
        processedRecipients: processedCount,
        successfulSends: successCount,
        failedSends: failCount,
        status: 'processing_batches', // still processing
        lastBatchProcessedAt: new Date(),
        batches: batchDetails // Overwrite with updated batch details array
      });
    } catch (dbError) {
        console.error(`Newsletter ${newsletterId}: Failed to update Firestore after batch ${batchNumber}:`, dbError);
        // Decide on error handling, maybe try to update status to 'error_in_db_update'
    }


    // If it's not the last batch, delay before the next one
    if (i + EMAIL_BATCH_SIZE < allRecipients.length) {
      console.log(`Newsletter ${newsletterId}: Batch ${batchNumber} complete. Waiting ${DELAY_BETWEEN_BATCHES_MS / 1000} seconds before next batch...`);
      await delay(DELAY_BETWEEN_BATCHES_MS);
    }
  }

  // All batches processed, final update
  const finalStatus = failCount > 0 ? 'completed_with_errors' : 'completed_successfully';
  try {
    await updateDoc(newsletterRef, {
      status: finalStatus,
      completedAt: new Date(),
      processedRecipients: processedCount, // Ensure final counts are accurate
      successfulSends: successCount,
      failedSends: failCount,
      batches: batchDetails // Final update of all batch details
    });
    console.log(`Newsletter ${newsletterId}: All batches processed. Status: ${finalStatus}. Successful: ${successCount}, Failed: ${failCount}.`);
  } catch (dbError) {
    console.error(`Newsletter ${newsletterId}: Failed to update Firestore with final status:`, dbError);
    // Attempt to mark as error if final update fails
     await updateDoc(newsletterRef, { status: 'error_final_db_update', errorDetails: dbError.message });
  }
}