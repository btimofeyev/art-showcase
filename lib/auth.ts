import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import type { SessionData } from "./types";

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET ?? "development-only-secret-min-32-chars!!",
  cookieName: "art-showcase-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function getSessionFromRequest(
  request: NextRequest,
  response: NextResponse,
) {
  return getIronSession<SessionData>(request, response, sessionOptions);
}

export function verifyPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  return password === adminPassword;
}

export async function requireAdminSession() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    throw new Error("Unauthorized");
  }
  return session;
}
