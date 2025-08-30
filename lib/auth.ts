import { auth, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import prisma from "./prisma";

export type Identity = { id: string; name?: string | null; image?: string | null; isGuest: boolean };

export async function getIdentity(): Promise<Identity> {
  try {
    const { userId } = await auth();

    if (userId) {
      // fetch Clerk profile server-side
      try {
        const clerkUser = await currentUser();
        const name =
          (clerkUser?.firstName ? `${clerkUser.firstName} ${clerkUser.lastName ?? ""}`.trim() : clerkUser?.username) ?? "User";
        const image = clerkUser?.imageUrl ?? null;

        await prisma.user.upsert({
          where: { id: userId },
          update: { name, image, isGuest: false },
          create: { id: userId, name, image, isGuest: false },
        });

        return { id: userId, name, image, isGuest: false };
      } catch (clerkError) {
        console.error("Clerk user fetch failed:", clerkError);
        // Fall back to basic user info with just the userId
        await prisma.user.upsert({
          where: { id: userId },
          update: { name: "User", isGuest: false },
          create: { id: userId, name: "User", isGuest: false },
        });
        
        return { id: userId, name: "User", image: null, isGuest: false };
      }
    }

    // Check for existing guest cookie
    const jar = await cookies();
    const existingGuestId = jar.get("guest_id")?.value;
    
    if (existingGuestId) {
      // Return existing guest identity
      const displayName = `Guest-${existingGuestId.slice(-6)}`;
      
      // Ensure user exists in database
      await prisma.user.upsert({
        where: { id: existingGuestId },
        update: { name: displayName, isGuest: true },
        create: { id: existingGuestId, name: displayName, isGuest: true },
      });
      
      return { id: existingGuestId, name: displayName, image: null, isGuest: true };
    }

    // No guest cookie exists - return a temporary identity that will trigger guest creation
    return { id: 'temp_guest', name: 'Guest', image: null, isGuest: true };
    
  } catch (error) {
    console.error("Identity resolution failed:", error);
    // Ultimate fallback - return temporary guest
    return { id: 'temp_guest', name: 'Guest', image: null, isGuest: true };
  }
}
