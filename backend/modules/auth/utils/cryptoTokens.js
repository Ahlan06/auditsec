import crypto from 'crypto';

export const generateRawToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

export const sha256Hex = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');

export const generateOtp = (digits = 6) => {
  const max = 10 ** digits;
  const n = crypto.randomInt(0, max);
  return String(n).padStart(digits, '0');
};

export const timingSafeEqualString = (a, b) => {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
};
