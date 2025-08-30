"use server";

import { getIdentity } from "@/lib/auth";
import { getCachedMessages, getCachedRooms } from "@/lib/cache";
import prisma from "@/lib/prisma";
import { revalidateTag } from "next/cache";

// Add these new server actions to your existing room.ts file
export async function getRooms() {
  try {
    await getIdentity(); // Ensure user is authenticated
    return await getCachedRooms();
  } catch (error) {
    console.error("Failed to fetch rooms:", error);
    throw new Error("Failed to fetch rooms");
  }
}

export async function getMessages(roomId: string) {
  try {
    await getIdentity(); // Ensure user is authenticated
    return await getCachedMessages(roomId);
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    throw new Error("Failed to fetch messages");
  }
}

export async function createRoom(name: string) {
  const me = await getIdentity();
  const room = await prisma.room.create({ data: { name } });
  await prisma.roomMember.create({
    data: { roomId: room.id, userId: me.id, role: "ADMIN" },
  });
  return room;
}

export async function joinRoom(roomId: string) {
  const me = await getIdentity();
  return prisma.joinRequest.create({
    data: { roomId, userId: me.id },
  });
}

export async function approveRequest(requestId: string) {
  const req = await prisma.joinRequest.update({
    where: { id: requestId },
    data: { status: "APPROVED" },
  });
  await prisma.roomMember.create({
    data: { roomId: req.roomId, userId: req.userId },
  });
  return req;
}

export async function promoteToAdmin(memberId: string) {
  return prisma.roomMember.update({
    where: { id: memberId },
    data: { role: "ADMIN" },
  });
}

export async function deleteRoom(roomId: string) {
  const me = await getIdentity();

  // Check if user is admin of the room
  const membership = await prisma.roomMember.findFirst({
    where: { roomId, userId: me.id, role: "ADMIN" },
  });

  if (!membership) {
    throw new Error("You don't have permission to delete this room");
  }

  // Delete all related data in correct order
  await prisma.$transaction(async (tx) => {
    // Delete messages
    await tx.message.deleteMany({ where: { roomId } });

    // Delete join requests
    await tx.joinRequest.deleteMany({ where: { roomId } });

    // Delete room members
    await tx.roomMember.deleteMany({ where: { roomId } });

    // Finally delete the room
    await tx.room.delete({ where: { id: roomId } });
  });

  // Revalidate cache
  revalidateTag("rooms");
  revalidateTag("room");
  revalidateTag("messages");
  revalidateTag("members");

  return { success: true };
}
