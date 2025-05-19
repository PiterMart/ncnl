import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }) {
  try {
    const data = await resend.emails.send({
      from: 'info@ncnl.co',
      to,
      subject,
      html,
    });

    console.log('Email sent:', data.id);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
