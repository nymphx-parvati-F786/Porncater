import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // 1. VIP PASS: Let Cloudflare's email webhook through untouched
  // (Cloudflare has its own x-cf-inbox-secret password to get in)
  if (pathname === '/api/admin/inbox' && req.method === 'POST') {
    return NextResponse.next();
  }

  // 2. THE GHOST PROTOCOL: Protect all /admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    
    // Check if the browser has your secret God-Tier cookie
    const godModeCookie = req.cookies.get('porncater_god_mode');

    // If they DON'T have the cookie, silently redirect them to the homepage!
    if (!godModeCookie || godModeCookie.value !== 'engaged') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // If they DO have the cookie, let them in smoothly.
    return NextResponse.next();
  }

  // 3. Let all regular users browse the main porn site freely
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};