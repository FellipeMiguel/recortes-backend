import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be defined in environment variables.");
}

export function generateToken(payload: object, expiresIn = "7d") {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn } as SignOptions);
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET as string);
}
