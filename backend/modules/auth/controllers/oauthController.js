import User from '../../../models/User.js';
import { signAccessToken } from '../utils/jwt.js';
import { getOAuthClients, getFrontendUrl } from '../oauth/oauthClients.js';

const normalizeEmail = (email) => (email ? String(email).toLowerCase().trim() : undefined);

const buildCallbackRedirect = (token, provider) => {
  const base = getFrontendUrl();
  // Token in query is simplest for scaffolding. In production prefer httpOnly cookies or a one-time code.
  return `${base}/auth/oauth/callback?provider=${encodeURIComponent(provider)}&token=${encodeURIComponent(token)}`;
};

export const oauthStart = async (req, res) => {
  const provider = String(req.params.provider || '').toLowerCase();
  const clients = await getOAuthClients();
  const entry = clients[provider];
  if (!entry) return res.status(400).json({ error: 'OAuth provider not configured' });

  const { client } = entry;
  const url = client.authorizationUrl({
    scope: 'openid email profile',
  });
  return res.redirect(url);
};

export const oauthCallback = async (req, res) => {
  try {
    const provider = String(req.params.provider || '').toLowerCase();
    const clients = await getOAuthClients();
    const entry = clients[provider];
    if (!entry) return res.status(400).json({ error: 'OAuth provider not configured' });

    const { client } = entry;
    const params = client.callbackParams(req);
    const tokenSet = await client.callback(client.metadata.redirect_uris[0], params, {});

    const claims = tokenSet.claims();
    const email = normalizeEmail(claims.email);
    const sub = claims.sub;

    if (!sub) return res.status(400).json({ error: 'OAuth missing subject' });

    // Find by provider sub first; fallback to email.
    const providerField = `oauth.${provider}.sub`;
    let user = await User.findOne({ [providerField]: sub });

    if (!user && email) {
      user = await User.findOne({ email });
    }

    if (!user) {
      user = await User.create({
        email,
        firstName: claims.given_name || claims.name,
        lastName: claims.family_name,
        emailVerified: Boolean(email),
        phoneVerified: false,
        oauth: { [provider]: { sub } },
      });
    } else {
      user.oauth = user.oauth || {};
      user.oauth[provider] = { sub };
      if (email && !user.email) user.email = email;
      if (email) user.emailVerified = true;
      user.lastLoginAt = new Date();
      await user.save();
    }

    const jwtToken = signAccessToken({ sub: String(user._id), email: user.email });
    return res.redirect(buildCallbackRedirect(jwtToken, provider));
  } catch (err) {
    console.error('OAuth callback error:', err);
    return res.status(500).json({ error: 'OAuth error' });
  }
};
