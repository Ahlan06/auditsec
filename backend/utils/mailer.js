import nodemailer from 'nodemailer';

const isConfigured = () => {
  return Boolean(
    (process.env.SMTP_HOST || '').trim() &&
      (process.env.SMTP_PORT || '').trim() &&
      (process.env.SMTP_USER || '').trim() &&
      (process.env.SMTP_PASS || '').trim() &&
      (process.env.FROM_EMAIL || '').trim()
  );
};

export const mailer = {
  isConfigured,
  async sendMail({ to, subject, html, text, replyTo, attachments }) {
    if (!isConfigured()) {
      const err = new Error('SMTP not configured');
      err.code = 'MAIL_NOT_CONFIGURED';
      throw err;
    }

    const port = Number(String(process.env.SMTP_PORT).trim());
    const smtpUser = String(process.env.SMTP_USER || '').trim();
    // Google App Password is often displayed with spaces: "abcd efgh ijkl mnop".
    // Remove spaces so users can paste it as-is.
    const smtpPass = String(process.env.SMTP_PASS || '').trim().replace(/\s+/g, '');
    const fromEmail = String(process.env.FROM_EMAIL || '').trim();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: fromEmail,
      to,
      ...(replyTo ? { replyTo } : {}),
      subject,
      text,
      html,
      ...(Array.isArray(attachments) && attachments.length > 0 ? { attachments } : {}),
    });
  },
};
