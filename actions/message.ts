"use server";

import prisma from "@/lib/prisma";
import { getIdentity } from "@/lib/auth";
import { revalidateMessagesCache } from "@/lib/cache";
import Ably from "ably";

export async function sendMessage(roomId: string, text: string) {
  const me = await getIdentity();
  
  const message = await prisma.message.create({
    data: { roomId, userId: me.id, text },
    include: { user: true }
  });

  // Invalidate cache
  await revalidateMessagesCache(roomId);

  // Broadcast to other users via Ably using server-side client
  try {
    if (process.env.ABLY_API_KEY) {
      const ably = new Ably.Realtime({ key: process.env.ABLY_API_KEY });
      const channel = ably.channels.get(`room:${roomId}`);
      
      await channel.publish('message', {
        ...message,
        createdAt: message.createdAt.toISOString()
      });
      
      // Close the connection after publishing
      ably.close();
    }
  } catch (error) {
    console.error('Failed to broadcast message:', error);
    // Don't fail the request if broadcasting fails
  }

  return message;
}
