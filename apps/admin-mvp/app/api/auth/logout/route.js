import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "../../../../lib/auth";

export async function POST(request) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    maxAge: 0,
    path: "/",
  });
  return response;
}
