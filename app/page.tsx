import AuthDropdown from "@/components/AuthDropdown";
import CreateRoomForm from "@/components/CreateRoomForm";
import GuestInitializer from "@/components/GuestInitializer";
import RoomCardDeleteButton from "@/components/RoomCardDeleteButton";
import { getIdentity } from "@/lib/auth";
import { getCachedRooms } from "@/lib/cache";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default async function HomePage() {
  const me = await getIdentity();

  if (me.id === "temp_guest") {
    return <GuestInitializer isTemporaryGuest={true} />;
  }

  const rooms = await getCachedRooms();

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center animate-pulse-glow">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Pulse
                </h1>
                <p className="text-sm text-muted-foreground">
                  Real-time conversations
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <SignedOut>
                <AuthDropdown />
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          <div className="text-center space-y-6 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Welcome to your
              <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Communication Hub
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create or join rooms to start meaningful conversations with your
              team, friends, or community.
            </p>

            <SignedOut>
              <div className="mt-8">
                <p className="text-muted-foreground mb-4">
                  Get started by choosing an option above ↗
                </p>
              </div>
            </SignedOut>
          </div>

          <div className="bg-card rounded-2xl border border-border/50 p-8 shadow-xl shadow-black/5 animate-fade-in">
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-success to-success/80 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">+</span>
              </div>
              Create New Room
            </h3>
            <CreateRoomForm />
            <SignedOut>
              <div className="mt-4 p-4 bg-accent/50 rounded-lg border border-border/30">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-5 h-5 bg-gradient-to-r from-warning/30 to-warning/20 rounded-full flex items-center justify-center">
                    <span className="text-warning text-xs">ℹ️</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    Guest Mode
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  You are using Pulse as a guest. You can create and join rooms,
                  but your session will be temporary.
                  <br />
                  Create an account from the menu above to save your rooms and
                  get a permanent profile.
                </p>
              </div>
            </SignedOut>
          </div>

          <div id="rooms" className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">#</span>
                </div>
                Available Rooms
              </h3>
              <span className="text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
                {rooms.length} rooms
              </span>
            </div>

            {rooms.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-2xl border border-dashed border-border">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-muted-foreground text-2xl">#</span>
                </div>
                <h4 className="text-lg font-medium text-foreground mb-2">
                  No rooms yet
                </h4>
                <p className="text-muted-foreground">
                  Create your first room to get started!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room, index) => {
                  const isAdmin =
                    room.members?.some(
                      (member) =>
                        member.userId === me.id && member.role === "ADMIN",
                    ) ?? false;

                  return (
                    <a
                      key={room.id}
                      href={`/room/${room.id}`}
                      className="group bg-card hover:bg-accent/50 rounded-xl border border-border/50 p-6 transition-all duration-200 hover:shadow-lg hover:shadow-black/5 hover:border-primary/20 animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-200">
                          <span className="text-primary font-semibold">#</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <RoomCardDeleteButton
                            roomId={room.id}
                            roomName={room.name}
                            isAdmin={isAdmin}
                          />
                          <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 truncate">
                        {room.name}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-2">
                        Click to join the conversation
                      </p>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">
                            {room._count?.members || 0} members
                          </span>
                          <span className="text-xs text-muted-foreground">
                            •
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {room._count?.messages || 0} messages
                          </span>
                        </div>
                        <span className="text-xs text-primary font-medium group-hover:text-primary/80">
                          Join →
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
