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
    
    // 🛡️ ARMOR 1: Always guarantee a unique message ID
    const messageId = parsed.messageId || `inbound-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Duplicate protection
    const existing = await prisma.inboxMessage.findFirst({ where: { messageId } });
    if (existing) {
      return NextResponse.json({ success: true, duplicate: true, id: existing.id });
    }

    // 🛡️ ARMOR 2: Enforce VarChar(500) limit so spam subjects don't crash the database
    const safeSubject = (parsed.subject || "(No Subject)").substring(0, 490);

    // 🛡️ ARMOR 3: Safely serialize headers so Prisma's JSON parser doesn't choke on weird objects
    let safeHeaders = {};
    try {
      safeHeaders = JSON.parse(JSON.stringify(Object.fromEntries(parsed.headers.entries())));
    } catch (e) {
      console.warn("Header parsing failed, saving empty headers");
    }

    // Save to Database
    const message = await prisma.inboxMessage.create({
      data: {
        messageId,
        subject: safeSubject,
        
        // 🛡️ ARMOR 4: Protect string lengths on sender data
        fromName: (parsed.from?.value?.[0]?.name || null)?.substring(0, 190),
        fromEmail: (parsed.from?.value?.[0]?.address || "unknown@unknown").substring(0, 190),
        replyTo: (parsed.replyTo?.value?.[0]?.address || null)?.substring(0, 190),
        
        textBody: parsed.text || null,
        htmlBody: typeof parsed.html === "string" ? parsed.html : null,
        sentAt: parsed.date || null,
        receivedAt: new Date(),
        sizeBytes: Buffer.byteLength(Buffer.from(rawEmail)),
        headers: safeHeaders,
        hasAttachments: Boolean(parsed.attachments && parsed.attachments.length > 0),
        
        // Relational Data: Recipients
        recipients: {
          create: [
            ...extractAddresses(parsed.to).map(r => ({ type: "TO" as const, name: r.name?.substring(0,190), email: r.email.substring(0,190) })),
            ...extractAddresses(parsed.cc).map(r => ({ type: "CC" as const, name: r.name?.substring(0,190), email: r.email.substring(0,190) })),
            ...extractAddresses(parsed.bcc).map(r => ({ type: "BCC" as const, name: r.name?.substring(0,190), email: r.email.substring(0,190) })),
          ],
        },

        // Relational Data: Attachments
        attachments: {
          create: (parsed.attachments || []).map(a => ({
            filename: (a.filename || "unknown").substring(0, 200),
            mimeType: (a.contentType || "application/octet-stream").substring(0, 100),
            sizeBytes: a.size || 0,
            contentId: a.cid || null,
            isInline: Boolean(a.cid),
          })),
        },
      },
    });

    return NextResponse.json({ success: true, id: message.id });
  } catch (error: any) {
    // 🔥 We log the ACTUAL error to Vercel so you can read it!
    console.error("🔥 INBOX PROCESSING FATAL ERROR 🔥", error);
    return NextResponse.json({ error: error.message || "Failed to process email" }, { status: 500 });
  }
}

// ==========================================
// GET: FETCH EMAILS FOR THE UI (WITH FOLDERS)
// ==========================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder") || "inbox";
    const adminEmail = "admin@porncater.com"; // MUST match the email you use in Resend!

    let whereClause: any = {};

    if (folder === "trash") {
      whereClause = { isTrashed: true };
    } else if (folder === "starred") {
      whereClause = { isTrashed: false, isStarred: true };
    } else if (folder === "sent") {
      whereClause = { isTrashed: false, fromEmail: adminEmail };
    } else {
      // Inbox: Not trashed, and not sent by you
      whereClause = { isTrashed: false, fromEmail: { not: adminEmail } };
    }

    const messages = await prisma.inboxMessage.findMany({
      where: whereClause,
      orderBy: { receivedAt: "desc" },
      select: {
        id: true,
        subject: true,
        fromName: true,
        fromEmail: true,
        textBody: true,
        isRead: true,
        isStarred: true, // Need this for the UI!
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