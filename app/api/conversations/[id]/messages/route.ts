import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../../lib/prisma";
import { getCurrentUser } from "../../../../../lib/auth/server";

const sendMessageSchema = z.object({
  content: z.string().trim().min(1, "Message cannot be empty").max(2000, "Message too long"),
});

/**
 * GET /api/conversations/[id]/messages
 *
 * Returns the conversation's other participant + full message thread
 * (oldest first), provided the current user is a participant.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: conversationId } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              companyName: true,
              role: true,
              imageFile: true,
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const isParticipant = conversation.participants.some((p) => p.userId === user.id);
  if (!isParticipant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const otherParticipant = conversation.participants.find((p) => p.userId !== user.id);

  // Mark unread messages from the other participant as read.
  await prisma.message.updateMany({
    where: { conversationId, senderId: { not: user.id }, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({
    conversationId: conversation.id,
    otherUser: otherParticipant?.user ?? null,
    messages: conversation.messages.map((m) => ({
      id: m.id,
      content: m.content,
      senderId: m.senderId,
      createdAt: m.createdAt.toISOString(),
      isRead: m.isRead,
    })),
  });
}

/**
 * POST /api/conversations/[id]/messages
 *
 * Body: { content: string }
 *
 * Sends a message into the conversation as the current user.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id: conversationId } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { participants: { select: { userId: true } } },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const isParticipant = conversation.participants.some((p) => p.userId === user.id);
  if (!isParticipant) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = sendMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fieldErrors: z.flattenError(parsed.error).fieldErrors },
      { status: 422 },
    );
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: user.id,
      content: parsed.data.content,
    },
  });

  return NextResponse.json(
    {
      message: {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        createdAt: message.createdAt.toISOString(),
        isRead: message.isRead,
      },
    },
    { status: 201 },
  );
}
