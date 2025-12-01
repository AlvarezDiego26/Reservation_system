// middleware.ts — TEST MODE
import { NextResponse } from "next/server";

export function middleware() {
  return NextResponse.next(); // no CORS, no rate limit
}

export const config = {
  matcher: "/api/:path*",
};
