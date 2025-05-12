import axios from "axios";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
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

const middlewareApiClient = axios.create({
  baseURL: process.env.API_URL,
  withCredentials: true,
});

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("session");
  try {
    // Validate session token
    await middlewareApiClient.get<UserResponseModel>("/api/user/me", {
      withCredentials: true,
      validateStatus: (status) => status >= 200 && status < 300,
      headers: { Cookie: `session=${session?.value}` },
    });
    // Token valid, redirect to dashboard if accessing login page
    if (request.nextUrl.pathname.startsWith("/user/")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } catch {
    if (request.nextUrl.pathname.startsWith("/user/"))
      return NextResponse.next();
    // Token invalid, redirect to login page if not accessing login page
    else return NextResponse.redirect(new URL("/user/login", request.url));
  }
  if (request.nextUrl.pathname.startsWith("/course-plan/")) {
    // Validate course plan ID
    const id = request.nextUrl.pathname.split("/")[2]; // Extract the ID from the URL (IDK HOW TO DO THIS BETTER)
    try {
      await middlewareApiClient.get(`/api/course-plans/${id}`, {
        headers: { Cookie: `session=${session?.value}` },
      });
    } catch (e) {
      // Yields a 404 error if the course plan is not found
      if (axios.isAxiosError(e)) {
        return NextResponse.error();
      }
    }
  }
  return NextResponse.next();
}
