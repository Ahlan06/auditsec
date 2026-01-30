import { createRemoteJWKSet, jwtVerify } from 'jose';

const getBaseUrl = () => (process.env.BACKEND_URL || 'http://localhost:3001');

export const getFrontendUrl = () => (process.env.FRONTEND_URL || 'http://localhost:5173');

export const getOAuthRedirectUri = (provider) => `${getBaseUrl()}/api/auth/oauth/${provider}/callback`;

let cachedClients;

const toFirstString = (value) => {
  if (Array.isArray(value)) return value.length ? String(value[0]) : undefined;
  if (value === undefined || value === null) return undefined;
  return String(value);
};

const createOidcClient = async ({ issuerUrl, clientId, clientSecret, redirectUri }) => {
  const oc = await import('openid-client');
  const config = await oc.discovery(
    new URL(issuerUrl),
    clientId,
    {
      client_secret: clientSecret,
      redirect_uris: [redirectUri],
      response_types: ['code'],
    },
  );

  // Compatibility wrapper for the previous openid-client (Issuer/Client) API
  // used by oauthController.js.
  const client = {
    metadata: { redirect_uris: [redirectUri] },
    authorizationUrl: ({ scope, state, nonce } = {}) => {
      return oc
        .buildAuthorizationUrl(config, {
          scope,
          redirect_uri: redirectUri,
          response_type: 'code',
          ...(state ? { state } : {}),
          ...(nonce ? { nonce } : {}),
        })
        .href;
    },
    callbackParams: (req) => req?.query || {},
    callback: async (redirectUriFromMetadata, params, checks) => {
      const currentUrl = new URL(redirectUriFromMetadata);
      for (const [key, rawValue] of Object.entries(params || {})) {
        const value = toFirstString(rawValue);
        if (value !== undefined) currentUrl.searchParams.set(key, value);
      }
      return oc.authorizationCodeGrant(config, currentUrl, checks || undefined, undefined);
    },
  };

  return { issuer: config.serverMetadata(), client };
};

export const getOAuthClients = async () => {
  if (cachedClients) return cachedClients;

  const google = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? await createOidcClient({
        issuerUrl: 'https://accounts.google.com',
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: getOAuthRedirectUri('google'),
      })
    : null;

  const microsoft = process.env.MS_CLIENT_ID && process.env.MS_CLIENT_SECRET && process.env.MS_TENANT_ID
    ? await createOidcClient({
        issuerUrl: `https://login.microsoftonline.com/${process.env.MS_TENANT_ID}/v2.0/.well-known/openid-configuration`,
        clientId: process.env.MS_CLIENT_ID,
        clientSecret: process.env.MS_CLIENT_SECRET,
        redirectUri: getOAuthRedirectUri('microsoft'),
      })
    : null;

  // Apple Sign-In uses OpenID Connect, but requires a JWT client_secret generated from your Apple key.
  // This file scaffolds the client; generating the Apple client secret is implemented in appleClientSecret.js.
  const apple = process.env.APPLE_CLIENT_ID
    ? await createOidcClient({
        issuerUrl: 'https://appleid.apple.com',
        clientId: process.env.APPLE_CLIENT_ID,
        clientSecret: process.env.APPLE_CLIENT_SECRET,
        redirectUri: getOAuthRedirectUri('apple'),
      })
    : null;

  cachedClients = { google, microsoft, apple };
  return cachedClients;
};

export const verifyGoogleIdToken = async (idToken) => {
  const jwks = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
  const { payload } = await jwtVerify(idToken, jwks, {
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return payload;
};
