import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const zoneId = searchParams.get("zoneId");

  // 🕵️ THE STEALTH SHIELD: We grab the user's real IP and Browser info
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";

  if (!zoneId) {
    return NextResponse.json({ error: "Missing zoneId" }, { status: 400 });
  }

  try {
    // 🚀 Server-to-Server request to ExoClick (AdBlockers cannot see this!)
    const exoRes = await fetch("https://s.magsrv.com/v1/api.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      // ExoClick requires this exact JSON structure
      body: JSON.stringify({
        user: {
          ip: ip,
          ua: userAgent
        },
        zones: [
          { id: zoneId }
        ]
      }),
      cache: "no-store", // Never cache ads! Every user needs unique targeted porn ads
    });
    
    const data = await exoRes.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Ad fetch failed" }, { status: 500 });
  }
}