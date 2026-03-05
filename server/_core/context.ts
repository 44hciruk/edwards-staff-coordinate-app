import type { Request, Response } from "express";
import { parse as parseCookieHeader } from "cookie";
import { jwtVerify } from "jose";
import { COOKIE_NAME } from "@shared/const";
import type { User } from "../../drizzle/schema";
import { ENV } from "./env";

export type TrpcContext = {
  req: Request;
  res: Response;
  user: User | null;
};

function getSecret(): Uint8Array {
  return new TextEncoder().encode(ENV.jwtSecret);
}

export async function createContext({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const cookieHeader = req.headers.cookie;
    const cookies = cookieHeader ? parseCookieHeader(cookieHeader) : {};
    const token = cookies[COOKIE_NAME];

    if (token) {
      const { payload } = await jwtVerify(token, getSecret(), {
        algorithms: ["HS256"],
      });
      const { email, name, role } = payload as Record<string, unknown>;

      if (typeof email === "string" && typeof role === "string") {
        user = {
          id: 0,
          openId: email,
          name: typeof name === "string" ? name : null,
          email,
          loginMethod: "email",
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        };
      }
    }
  } catch {
    user = null;
  }

  return { req, res, user };
}
