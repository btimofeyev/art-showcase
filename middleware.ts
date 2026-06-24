import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

const protectedApiPaths = [
  "/api/upload",
  "/api/settings",
];

function isProtectedApi(pathname: string, method: string): boolean {
  if (method === "GET") {
    return false;
  }

  if (pathname.match(/^\/api\/artworks\/[^/]+\/heart$/)) {
    return false;
  }

  if (pathname.match(/^\/api\/artworks\/[^/]+\/comments$/)) {
    return false;
  }

  if (protectedApiPaths.some((path) => pathname.startsWith(path))) {
    return true;
  }

  if (pathname.startsWith("/api/artworks")) {
    return true;
  }

  if (pathname.startsWith("/api/auth/logout")) {
    return true;
  }

  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  const response = NextResponse.next();
  const session = await getSessionFromRequest(request, response);

  if (pathname.startsWith("/admin")) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");

    if (pathname !== "/admin/login" && !session.isLoggedIn) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  if (isProtectedApi(pathname, method) && !session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/upload", "/api/settings", "/api/artworks/:path*", "/api/auth/logout"],
};
