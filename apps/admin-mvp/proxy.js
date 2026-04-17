import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isAuthorizedSessionValue } from "./lib/auth";

export function proxy(request) {
  const sessionValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (isAuthorizedSessionValue(sessionValue)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/leads/:path*"],
};
