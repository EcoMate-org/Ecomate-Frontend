import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth/server";

const startConversationSchema = z.object({
  recipientId: z.string().min(1),
});

/**
 * POST /api/conversations/start
 *
 * Body: { recipientId: string }
 *
 * Finds an existing 1:1 conversation between the current user and
 * `recipientId`, or creates one. Returns { conversationId }.
 *
 * Used by the "Message Seller" action on the product detail sidebar.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = startConversationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fieldErrors: z.flattenError(parsed.error).fieldErrors },
      { status: 422 },
    );
  }

  const { recipientId } = parsed.data;

  if (recipientId === user.id) {
    return NextResponse.json(
      { error: "You cannot start a conversation with yourself." },
      { status: 400 },
    );
  }

  const recipient = await prisma.user.findUnique({
    where: { id: recipientId },
    select: { id: true },
  });
  if (!recipient) {
    return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
  }

  // Look for an existing conversation that has exactly these two
  // participants. ConversationParticipant has a @@unique([conversationId, userId]),
  // so we find conversations containing the current user, then check
  // which of those also contain the recipient (and only the recipient).
  const existing = await prisma.conversation.findFirst({
    where: {
      participants: { some: { userId: user.id } },
      AND: { participants: { some: { userId: recipientId } } },
    },
    include: { participants: { select: { userId: true } } },
  });

  const exactMatch = existing && existing.participants.length === 2 ? existing : null;

  if (exactMatch) {
    return NextResponse.json({ conversationId: exactMatch.id });
  }

  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: user.id }, { userId: recipientId }],
      },
    },
  });

  return NextResponse.json({ conversationId: conversation.id }, { status: 201 });
}
