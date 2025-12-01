// /middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://hotel-frontend-30o66e5zk-diegos-projects-267cd6b3.vercel.app",
];

export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin") || "";

  const res = NextResponse.next();

  if (allowedOrigins.includes(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin);
  } else {
    res.headers.set("Access-Control-Allow-Origin", "*");
  }

  res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: res.headers,
    });
  }

  return res;
}

export const config = {
  matcher: "/api/:path*",
};
