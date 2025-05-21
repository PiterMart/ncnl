import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER, // Make sure these are set in your .env.local or environment variables
    pass: process.env.MAIL_PASS,
  },
});

export async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"NCNL" <${process.env.MAIL_USER}>`, // Replace NCNL with your sender name
      to,
      subject,
      html,
      headers: { // These headers might help with deliverability but aren't a silver bullet
        'X-Priority': '3', // Normal priority
        'X-MSMail-Priority': 'Normal',
        'Importance': 'normal'
      }
    });
    console.log('Email sent:', info.messageId, 'to:', to);
    return true;
  } catch (error) {
    console.error('Error sending email to:', to, error);
    throw error; // Re-throw to be caught by the batch processor
  }
}