"use server";

import { BaseClient, Issuer, generators } from "openid-client";

let client: BaseClient | null = null;

export async function getClient() {
  if (client) return client;
  const issuer = await Issuer.discover("https://accounts.google.com");
  client = new issuer.Client({
    client_id: process.env.GOOGLE_OPENID_CLIENT_ID ?? "",
    client_secret: process.env.GOOGLE_OPENID_CLIENT_SECRET,
    redirect_uris: [
      process.env.BASE_URL + process.env.GOOGLE_OPENID_REDIRECT_URI
    ],
    response_types: ["code"]
  });
  return client;
}

export async function generateAuthorizationUrl() {
  const codeVerifier = generators.codeVerifier();
  const codeChallenge = generators.codeChallenge(codeVerifier);
  const nonce = generators.nonce();
  const client = await getClient();
  return {
    url: client.authorizationUrl({
      scope: "openid email",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      nonce: nonce,
      response_type: "code"
    }),
    codeVerifier,
    nonce
  };
}

export async function claims(
  requestUrl: string,
  codeVerifier: string,
  nonce?: string
) {
  const client = await getClient();
  const params = client.callbackParams(requestUrl);
  const tokenSet = await client.callback(
    client.metadata.redirect_uris?.[0],
    params,
    { code_verifier: codeVerifier, nonce }
  );
  return tokenSet.claims();
}
