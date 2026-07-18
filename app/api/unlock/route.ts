import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  // Check if the secret key matches your environment variable
  if (key === process.env.ADMIN_SECRET_KEY) {
    // 1. Create a response that redirects you straight to your sexy inbox
    const response = NextResponse.redirect(new URL("/admin/inbox", request.url));

    // 2. Plant the invisible God-Tier cookie in your browser (lasts for 7 days)
    response.cookies.set("porncater_god_mode", "engaged", {
      httpOnly: true, // Javascript can't read it (immune to XSS attacks)
      secure: process.env.NODE_ENV === "production", // Only over HTTPS
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days of seamless access
    });

    return response;
  }

  // If some random person tries to guess the URL but gets the key wrong?
  // Instantly redirect them to the homepage.
  return NextResponse.redirect(new URL("/", request.url));
}