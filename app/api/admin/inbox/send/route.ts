import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { to, subject, textBody } = await request.json();

    // 1. Send the email out to the real world
    const { data, error } = await resend.emails.send({
      from: 'Porncater Admin <admin@porncater.com>', // MUST match your verified domain
      to: [to],
      subject: subject,
      text: textBody,
    });

    if (error) {
      console.error("Resend Error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // 2. Save it to your Prisma DB so it shows up in your Sent folder
    const savedMessage = await prisma.inboxMessage.create({
      data: {
        messageId: data?.id || `outbound-${Date.now()}`,
        subject: subject,
        fromName: "Porncater Admin",
        fromEmail: "admin@porncater.com",
        textBody: textBody,
        receivedAt: new Date(), // Using this as 'sent' time
        isRead: true, // You wrote it, so it's read
        hasAttachments: false,
        recipients: {
          create: [{ type: "TO", email: to, name: to }]
        }
      }
    });

    return NextResponse.json({ success: true, message: savedMessage });
  } catch (error) {
    console.error("Failed to send email:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}