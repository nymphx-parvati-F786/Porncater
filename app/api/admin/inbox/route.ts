import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // 🛡️ SECURITY TOKEN CHECK
    // Prevents bad actors from hitting your API and spamming your inbox table
    const secretToken = request.headers.get("x-cf-inbox-secret");
    if (secretToken !== process.env.EMAIL_WORKER_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { to, from, subject, text } = body;

    if (!to || !from) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Insert the incoming corporate message straight into Supabase
    const message = await prisma.inboxMessage.create({
      data: {
        to,
        from,
        subject: subject || "(No Subject)",
        body: text || "(No Content Provided)",
      },
    });

    return NextResponse.json({ success: true, messageId: message.id });
  } catch (error) {
    console.error("Inbox Processing Error:", error);
    return NextResponse.json({ error: "Internal processing error" }, { status: 500 });
  }
}