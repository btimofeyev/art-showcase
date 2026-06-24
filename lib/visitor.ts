import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export const VISITOR_COOKIE = "art-showcase-visitor";

export async function getVisitorKey(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(VISITOR_COOKIE)?.value ?? null;
}

export function ensureVisitorCookie(
  response: NextResponse,
  visitorKey?: string,
) {
  const key = visitorKey ?? randomUUID();
  response.cookies.set(VISITOR_COOKIE, key, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return key;
}

export async function resolveVisitorKey(): Promise<{
  visitorKey: string;
  needsCookie: boolean;
}> {
  const existing = await getVisitorKey();
  if (existing) {
    return { visitorKey: existing, needsCookie: false };
  }
  return { visitorKey: randomUUID(), needsCookie: true };
}

export function attachVisitorCookie(
  response: NextResponse,
  visitorKey: string,
) {
  ensureVisitorCookie(response, visitorKey);
}
