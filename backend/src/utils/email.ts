import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT || 587),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function sendOrganizerRejectionEmail(to: string, tripTitle: string, reason: string) {
  if (!process.env.MAIL_HOST) {
    console.warn('MAIL_HOST not configured; skipping email');
    return;
  }
  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to,
    subject: `Your trip "${tripTitle}" was rejected`,
    text: `Your trip "${tripTitle}" was rejected for the following reason:\n${reason}`,
  });
}
