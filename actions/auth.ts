"use server";

import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/prisma";

export async function createGuestIdentity() {
  const jar = await cookies();
  let guestId = jar.get("guest_id")?.value;
  
  if (!guestId) {
    guestId = `guest_${uuidv4()}`;
    jar.set({
      name: "guest_id",
      value: guestId,
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  // Create DB user if not exists
  const displayName = `Guest-${guestId.slice(-6)}`;
  await prisma.user.upsert({
    where: { id: guestId },
    update: { name: displayName, isGuest: true },
    create: { id: guestId, name: displayName, isGuest: true },
  });

  return { id: guestId, name: displayName, image: null, isGuest: true };
}
