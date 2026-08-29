import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminSession } from "@/src/lib/admin-session";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Cloudflare email worker authenticates with its own secret header.
  if (pathname === "/api/admin/inbox" && req.method === "POST") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    const ok = await verifyAdminSession(token);

    if (!ok) {
      const denied = NextResponse.redirect(new URL("/", req.url));
      denied.cookies.delete(ADMIN_COOKIE);
      denied.cookies.delete("porncater_god_mode");
      denied.headers.set("Cache-Control", "private, no-store");
      return denied;
    }

    const pass = NextResponse.next();
    pass.headers.set("Cache-Control", "private, no-store");
    return pass;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
