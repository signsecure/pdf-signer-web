import { type NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  console.log(request.url, "middleware");

  const sessionCookie = getSessionCookie(request); // Optionally pass config as the second argument if cookie name or prefix is customized.
  if (!sessionCookie || sessionCookie == null) {
    console.log(request.url, "middleware2");
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  console.log(sessionCookie, "middleware3");
  return NextResponse.next();
}

export const config = {
  matcher: ["/"], // Specify the routes the middleware applies to
};
