import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow all requests to pass through
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
}; 