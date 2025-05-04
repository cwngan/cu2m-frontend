import axios from "axios";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UserResponseModel } from "./app/types/ApiResponseModel";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session");
  try {
    await axios.request<UserResponseModel>({
      url: "/api/user/me",
      baseURL: process.env.API_URL,
      method: "GET",
      withCredentials: true,
      validateStatus: (status) => status >= 200 && status < 300,
      headers: { Cookie: `session=${session?.value}` },
    });
    if (request.nextUrl.pathname.startsWith("/user")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  } catch {
    if (request.nextUrl.pathname.startsWith("/user"))
      return NextResponse.next();
    else return NextResponse.redirect(new URL("/user/login", request.url));
  }
}
