import { unstable_cache } from "next/cache";
import prisma from "./prisma";

const CACHE_TAGS = {
  ROOMS: "rooms",
  ROOM: "room",
  MESSAGES: "messages",
  MEMBERS: "members",
} as const;

export const getCachedRooms = unstable_cache(
  async () => {
    return await prisma.room.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        _count: {
          select: {
            members: true,
            messages: true,
          },
        },
        members: {
          select: {
            id: true,
            userId: true,
            role: true,
          },
        },
      },
    });
  },
  ["rooms-list"],
  {
    tags: [CACHE_TAGS.ROOMS],
    revalidate: 30,
  },
);

export const getCachedRoom = unstable_cache(
  async (roomId: string) => {
    return await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        _count: {
          select: {
            members: true,
            messages: true,
          },
        },
      },
    });
  },
  ["room-details"],
  {
    tags: [CACHE_TAGS.ROOM],
    revalidate: 60,
  },
);

export const getCachedMessages = unstable_cache(
  async (roomId: string, limit = 50) => {
    return await prisma.message.findMany({
      where: { roomId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
      take: limit,
    });
  },
  ["room-messages"],
  {
    tags: [CACHE_TAGS.MESSAGES],
    revalidate: 15,
  },
);

export async function revalidateRoomsCache() {
  const { revalidateTag } = await import("next/cache");
  revalidateTag(CACHE_TAGS.ROOMS);
}

export async function revalidateRoomCache(roomId?: string) {
  const { revalidateTag } = await import("next/cache");
  revalidateTag(CACHE_TAGS.ROOM);
  if (roomId) {
    revalidateTag(`${CACHE_TAGS.ROOM}-${roomId}`);
  }
}

export async function revalidateMessagesCache(roomId?: string) {
  const { revalidateTag } = await import("next/cache");
  revalidateTag(CACHE_TAGS.MESSAGES);
  if (roomId) {
    revalidateTag(`${CACHE_TAGS.MESSAGES}-${roomId}`);
  }
}
