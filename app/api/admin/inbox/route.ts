import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const secretToken = request.headers.get("x-cf-inbox-secret");
    if (secretToken !== process.env.EMAIL_WORKER_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { to, from, subject, text, isHtml } = body;

    const message = await prisma.inboxMessage.create({
      data: {
        to,
        from,
        subject: subject || "(No Subject)",
        body: text || "(No Content Provided)",
        isHtml: isHtml || false,
      },
    });

    return NextResponse.json({ success: true, messageId: message.id });
  } catch (error) {
    return NextResponse.json({ error: "Internal processing error" }, { status: 500 });
  }
}