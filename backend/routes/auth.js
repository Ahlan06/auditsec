import express from 'express';
import { requireAuth } from '../middleware/jwtAuth.js';
import {
  authController,
  verificationController,
  passwordController,
  phoneAuthController,
  oauthController,
} from '../modules/auth/index.js';

const router = express.Router();

// Manual auth
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected
router.get('/me', requireAuth, authController.me);

// Email verification
router.post('/verify/email/request', requireAuth, verificationController.requestEmailVerification);
router.post('/verify/email/confirm', verificationController.confirmEmailVerification);

// Phone verification
router.post('/verify/phone/request', requireAuth, verificationController.requestPhoneVerification);
router.post('/verify/phone/confirm', requireAuth, verificationController.confirmPhoneVerification);

// Password reset (email or sms)
router.post('/password/forgot', passwordController.forgotPassword);
router.post('/password/reset/token', passwordController.resetPasswordWithToken);
router.post('/password/reset/sms', passwordController.resetPasswordWithSmsCode);

// Phone authentication (SMS OTP)
router.post('/phone/start', phoneAuthController.startPhoneAuth);
router.post('/phone/verify', phoneAuthController.verifyPhoneAuth);

// OAuth2 / OIDC providers
router.get('/oauth/:provider', oauthController.oauthStart);
router.get('/oauth/:provider/callback', oauthController.oauthCallback);

export default router;
