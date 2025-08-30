import ChatRoom from "@/components/ChatRoom";
import DeleteRoomButton from "@/components/DeleteRoomButton";
import GuestInitializer from "@/components/GuestInitializer";
import JoinRoomButton from "@/components/JoinRoomButton";
import RoomJoinRequests from "@/components/RoomJoinRequests";
import RoomMemberList from "@/components/RoomMemberList";
import { getIdentity } from "@/lib/auth";
import { getCachedMessages, getCachedRoom } from "@/lib/cache";
import prisma from "@/lib/prisma";
import type { JoinRequest, RoomMember, User } from "@prisma/client";
import Link from "next/link";

type MemberWithUser = RoomMember & { user: User };
type JoinRequestWithUser = JoinRequest & { user: User };

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: roomId } = await params;
  const me = await getIdentity();

  if (me.id === "temp_guest") {
    return <GuestInitializer isTemporaryGuest={true} />;
  }

  const [room, members, requests, messages] = await Promise.all([
    getCachedRoom(roomId),
    prisma.roomMember.findMany({ where: { roomId }, include: { user: true } }),
    prisma.joinRequest.findMany({
      where: { roomId, status: "PENDING" },
      include: { user: true },
    }),
    getCachedMessages(roomId),
  ]);

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/20">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-r from-error/20 to-error/10 rounded-2xl flex items-center justify-center mx-auto">
            <span className="text-error text-3xl">⚠️</span>
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-foreground">
              Room not found
            </h2>
            <p className="text-muted-foreground max-w-md">
              This room does not exist or has been deleted. It might have been
              removed by the administrator.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground rounded-xl transition-all duration-200 font-medium hover:shadow-lg hover:shadow-primary/25"
          >
            <span>←</span>
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  const myMembership =
    (members as MemberWithUser[]).find((m) => m.userId === me.id) ?? null;
  const isAdmin = myMembership?.role === "ADMIN";

  const initialMessages = messages.map((m) => ({
    id: m.id,
    roomId: m.roomId,
    userId: m.userId || "",
    text: m.text || "",
    createdAt: m.createdAt,
    user: m.user
      ? {
          id: m.user.id,
          name: m.user.name,
          image: m.user.image,
        }
      : null,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-3 hover:opacity-70 transition-opacity duration-200 group"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/25 transition-all duration-200">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                  ← Back
                </span>
              </Link>
              <div className="w-px h-6 bg-border/50"></div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                  <span className="text-primary font-semibold text-lg">#</span>
                </div>
                <div>
                  <h1 className="font-semibold text-foreground text-lg">
                    {room.name}
                  </h1>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                    <span className="text-sm text-muted-foreground">
                      {members.length} member{members.length !== 1 ? "s" : ""}{" "}
                      online
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {!myMembership && <JoinRoomButton roomId={roomId} />}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <section className="lg:col-span-3 animate-fade-in">
            {myMembership ? (
              <ChatRoom roomId={roomId} initialMessages={initialMessages} />
            ) : (
              <div className="bg-card rounded-2xl border border-border/50 p-12 text-center shadow-xl shadow-black/5">
                <div className="w-20 h-20 bg-gradient-to-r from-warning/20 to-warning/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-warning text-3xl">🔒</span>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-foreground">
                    Join to participate
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    You need to be a member of this room to view and send
                    messages. Request to join to start chatting!
                  </p>
                  <div className="pt-4">
                    <JoinRoomButton roomId={roomId} />
                  </div>
                </div>
              </div>
            )}
          </section>

          <aside
            className="space-y-6 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <RoomMemberList
              roomId={roomId}
              initialMembers={members as MemberWithUser[]}
              isAdmin={isAdmin}
            />

            {isAdmin && requests.length > 0 && (
              <RoomJoinRequests
                roomId={roomId}
                initialRequests={requests as JoinRequestWithUser[]}
              />
            )}

            {isAdmin && (
              <div className="bg-card rounded-2xl border border-destructive/20 p-6 shadow-lg shadow-black/5">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center">
                    <span className="text-destructive text-sm">⚠️</span>
                  </div>
                  Danger Zone
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg border border-destructive/10">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-1">
                        Delete Room
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete this room and all its data. This
                        cannot be undone.
                      </p>
                    </div>
                    <div className="ml-4">
                      <DeleteRoomButton roomId={roomId} roomName={room.name} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-lg shadow-black/5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary text-sm">ℹ️</span>
                </div>
                Room Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Messages</span>
                  <span className="text-foreground font-medium">
                    {messages.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Members</span>
                  <span className="text-foreground font-medium">
                    {members.length}
                  </span>
                </div>
                {requests.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Pending</span>
                    <span className="text-warning font-medium">
                      {requests.length}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-border/30">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                    <span className="text-muted-foreground">
                      Room is active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
