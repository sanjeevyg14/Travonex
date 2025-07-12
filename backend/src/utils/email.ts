import nodemailer from 'nodemailer';
import env from '../config';

const transporter = nodemailer.createTransport({
  host: env.MAIL_HOST,
  port: Number(env.MAIL_PORT || 587),
  secure: false,
  auth: {
    user: env.MAIL_USER,
    pass: env.MAIL_PASS,
  },
});

export async function sendOrganizerRejectionEmail(to: string, tripTitle: string, reason: string) {
  if (!env.MAIL_HOST) {
    console.warn('MAIL_HOST not configured; skipping email');
    return;
  }
  await transporter.sendMail({
    from: env.MAIL_USER,
    to,
    subject: `Your trip "${tripTitle}" was rejected`,
    text: `Your trip "${tripTitle}" was rejected for the following reason:\n${reason}`,
  });
}
