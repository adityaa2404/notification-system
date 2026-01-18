/**
 * FCM Push Notification Channel
 * Sends push notifications using Firebase Cloud Messaging HTTP v1 API
 * Requires service account credentials for OAuth2 authentication
 */

interface PushNotificationData {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

interface ServiceAccountCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
}

/**
 * Creates a JWT for Google OAuth2 authentication
 */
async function createJWT(credentials: ServiceAccountCredentials): Promise<string> {
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: credentials.token_uri,
    iat: now,
    exp: now + 3600, // 1 hour
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import the private key for signing
  const pemContents = credentials.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  
  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    encoder.encode(unsignedToken)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${unsignedToken}.${signatureB64}`;
}

/**
 * Gets an OAuth2 access token using service account credentials
 */
async function getAccessToken(credentials: ServiceAccountCredentials): Promise<string> {
  const jwt = await createJWT(credentials);

  const res = await fetch(credentials.token_uri, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to get access token: ${errorText}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function sendPush({
  token,
  title,
  body,
  data,
}: PushNotificationData) {
  const credentialsJson = Deno.env.get("FCM_SERVICE_ACCOUNT");

  if (!credentialsJson) {
    throw new Error("FCM_SERVICE_ACCOUNT is not set");
  }

  if (!token) {
    throw new Error("FCM device token is required");
  }

  let credentials: ServiceAccountCredentials;
  try {
    credentials = JSON.parse(credentialsJson);
  } catch {
    throw new Error("FCM_SERVICE_ACCOUNT is not valid JSON");
  }

  const accessToken = await getAccessToken(credentials);

  const payload = {
    message: {
      token,
      notification: {
        title,
        body,
      },
      ...(data && { data }),
    },
  };

  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${credentials.project_id}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`FCM error: ${errorText}`);
  }

  return await res.json();
}
