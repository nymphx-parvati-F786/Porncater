import { NextRequest, NextResponse } from "next/server";
import { simpleParser } from "mailparser";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Helper to safely extract emails from mailparser's strict types
// Helper to safely extract emails from mailparser's strict types
const extractAddresses = (
  addressField: any
): Array<{ name: string | null; email: string }> => {
  if (!addressField) return [];
  
  // Handle both single objects and arrays safely
  const values = Array.isArray(addressField) 
    ? addressField.flatMap((f: any) => f.value || []) 
    : addressField.value || [];
    
  return values.map((v: any) => ({
    name: v.name || null,
    email: v.address || "unknown",
  }));
};

// ==========================================
// POST: RECEIVE EMAILS FROM CLOUDFLARE
// ==========================================
export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get("x-cf-inbox-secret");
    if (!secret || secret !== process.env.EMAIL_WORKER_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawEmail = await request.arrayBuffer();
    if (!rawEmail || rawEmail.byteLength === 0) {
      return NextResponse.json({ error: "Empty payload" }, { status: 400 });
    }

    // Parse the raw MIME email
    const parsed = await simpleParser(Buffer.from(rawEmail));
    const messageId = parsed.messageId || null;

    // Duplicate protection
    if (messageId) {
      const existing = await prisma.inboxMessage.findUnique({ where: { messageId } });
      if (existing) {
        return NextResponse.json({ success: true, duplicate: true, id: existing.id });
      }
    }

    // Save to Database
    const message = await prisma.inboxMessage.create({
      data: {
        messageId,
        subject: parsed.subject || "(No Subject)",
        fromName: parsed.from?.value?.[0]?.name || null,
        fromEmail: parsed.from?.value?.[0]?.address || "unknown@unknown",
        replyTo: parsed.replyTo?.value?.[0]?.address || null,
        textBody: parsed.text || null,
        htmlBody: typeof parsed.html === "string" ? parsed.html : null,
        sentAt: parsed.date || null,
        receivedAt: new Date(),
        sizeBytes: Buffer.byteLength(Buffer.from(rawEmail)),
        headers: Object.fromEntries(parsed.headers.entries()) as any,
        hasAttachments: Boolean(parsed.attachments && parsed.attachments.length > 0),
        
        // Relational Data: Recipients
        recipients: {
          create: [
            ...extractAddresses(parsed.to).map(r => ({ type: "TO" as const, name: r.name, email: r.email })),
            ...extractAddresses(parsed.cc).map(r => ({ type: "CC" as const, name: r.name, email: r.email })),
            ...extractAddresses(parsed.bcc).map(r => ({ type: "BCC" as const, name: r.name, email: r.email })),
          ],
        },

        // Relational Data: Attachments (Storing metadata, file uploads to Bunny/Supabase can be wired up here later)
        attachments: {
          create: (parsed.attachments || []).map(a => ({
            filename: a.filename || "unknown",
            mimeType: a.contentType || "application/octet-stream",
            sizeBytes: a.size || 0,
            contentId: a.cid || null,
            isInline: Boolean(a.cid),
          })),
        },
      },
    });

    return NextResponse.json({ success: true, id: message.id });
  } catch (error) {
    console.error("Inbox processing error:", error);
    return NextResponse.json({ error: "Failed to process email" }, { status: 500 });
  }
}

// ==========================================
// GET: FETCH EMAILS FOR THE UI
// ==========================================
export async function GET(request: NextRequest) {
  try {
    // In a real app, check admin session/auth here!
    const messages = await prisma.inboxMessage.findMany({
      where: { isTrashed: false },
      orderBy: { receivedAt: "desc" },
      select: {
        id: true,
        subject: true,
        fromName: true,
        fromEmail: true,
        textBody: true,
        isRead: true,
        receivedAt: true,
        hasAttachments: true,
      },
      take: 50,
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Failed to fetch inbox:", error);
    return NextResponse.json({ error: "Failed to fetch emails" }, { status: 500 });
  }
}