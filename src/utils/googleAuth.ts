import { OAuth2Client, TokenPayload } from "google-auth-library";
import "dotenv/config";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function verifyGoogleIdToken(
  idToken: string
): Promise<TokenPayload> {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error("Invalid ID token");
  }
  return payload;
}
