import { verifyToken } from "@clerk/express";

export async function isVerifiedWithClerk(token: string | undefined) {
  if (!token) return false;
  const result = await verifyToken(token, {
    jwtKey: process.env.CLERK_JWT_KEY,
  });
  return result.sub ? result : false;
}
