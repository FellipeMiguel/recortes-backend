import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { verifyGoogleIdToken } from "../utils/googleAuth";

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export async function authenticateGoogle(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Authorization header is missing" });
    }
    const [, idToken] = authHeader.split(" ");
    if (!idToken) {
      return res.status(401).json({ message: "Bearer token is missing" });
    }

    const payload = await verifyGoogleIdToken(idToken);

    const googleId = payload.sub!;
    const email = payload.email!;
    const name = payload.name;

    let user = await prisma.user.findUnique({ where: { googleId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId,
          email,
          name,
        },
      });
    }

    (req as AuthenticatedRequest).user = {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
    };

    next();
  } catch (err: any) {
    console.error("Authentication error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
