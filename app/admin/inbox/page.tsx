import { PrismaClient } from "@prisma/client";
import InboxClientLayout from "./InboxClientLayout";

const prisma = new PrismaClient();

// Forces Next.js to bypass static optimization so new emails show up instantly on refresh
export const dynamic = "force-dynamic";

export default async function AdminInboxPage() {
  // Query your Supabase cluster for all logged incoming transmissions
  const messages = await prisma.inboxMessage.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  // Format database dates into safe, plain serializable objects for the Client Component
  const serializedMessages = messages.map((msg) => ({
    ...msg,
    createdAt: msg.createdAt.toISOString(),
  }));

  return <InboxClientLayout initialMessages={serializedMessages} />;
}