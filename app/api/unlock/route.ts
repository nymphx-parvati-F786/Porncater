import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_OPTIONS,
  signAdminSession,
} from "@/src/lib/admin-session";
import { clientIp, rateLimit } from "@/src/lib/rate-limit";

export const dynamic = "force-dynamic";

function isValidKey(key: string | null): boolean {
  if (!key) return false;
  const a = process.env.ADMIN_SECRET_KEY;
  const b = process.env.ADMIN_SECRET;
  return Boolean((a && key === a) || (b && key === b));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const ip = clientIp(request);
  const limited = rateLimit(`unlock:${ip}`, 8, 15 * 60 * 1000);

  if (!limited.ok) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isValidKey(key)) {
    const token = await signAdminSession();
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const response = NextResponse.redirect(new URL("/admin/inbox", request.url));
    response.cookies.set(ADMIN_COOKIE, token, ADMIN_COOKIE_OPTIONS);
    response.cookies.delete("porncater_god_mode");
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  return NextResponse.redirect(new URL("/", request.url));
}
