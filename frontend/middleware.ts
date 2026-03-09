import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Rewrite /extra-income/ to /extra-income so we serve the page without redirecting.
 * (Host often redirects /extra-income → /extra-income/; Next then redirects / → no slash → loop.)
 * This runs before Next.js redirects, so we break the loop. Other routes (e.g. /breaking-news) unchanged.
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname === "/extra-income/") {
    const url = request.nextUrl.clone();
    url.pathname = "/extra-income";
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/extra-income/",
};
