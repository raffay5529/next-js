import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/auth";

export default async function Proxy(request: NextRequest) {

  const session = await getSession();

  const isRootPage      = request.nextUrl.pathname === "/";
  const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");
  const isLoginPage     = request.nextUrl.pathname.startsWith("/login");
  const isBoardPage     = request.nextUrl.pathname.startsWith("/board");

  // Visiting / → send logged-in users to /board, others to /login
  if (isRootPage) {
    return session?.user
      ? NextResponse.redirect(new URL("/board", request.url))
      : NextResponse.redirect(new URL("/login", request.url));
  }

  // Protect /board — redirect unauthenticated users to /login
  if (isBoardPage && !session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Protect /dashboard — redirect unauthenticated users to /login
  if (isDashboardPage && !session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Already logged in, no need to see /login — send to /board
  if (isLoginPage && session?.user) {
    return NextResponse.redirect(new URL("/board", request.url));
  }

  return NextResponse.next();
}