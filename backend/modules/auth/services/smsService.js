import twilio from 'twilio';

const isSmsConfigured = () => {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER);
};

const getClient = () => {
  if (!isSmsConfigured()) {
    const err = new Error('SMS provider not configured');
    err.code = 'SMS_NOT_CONFIGURED';
    throw err;
  }
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
};

export const sendSms = async ({ to, body }) => {
  const client = getClient();
  return client.messages.create({ from: process.env.TWILIO_FROM_NUMBER, to, body });
};

export const sendPhoneVerificationCode = async ({ to, code }) => {
  const body = `AuditSec: ton code de vérification est ${code} (valide 10 min).`;
  return sendSms({ to, body });
};

export const sendPasswordResetCodeSms = async ({ to, code }) => {
  const body = `AuditSec: code de réinitialisation ${code} (valide 10 min).`;
  return sendSms({ to, body });
};
