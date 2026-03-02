import { NextRequest, NextResponse } from "next/server"

export function middleware(req: NextRequest): NextResponse {
  if (
    req.nextUrl.pathname === "/register" &&
    process.env.REGISTRATION_ENABLED === "false"
  ) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/register"],
}
