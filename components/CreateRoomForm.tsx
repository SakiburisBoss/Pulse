"use client";

import { useState } from "react";
import { useRoomStore } from "@/stores/store";

export default function CreateRoomForm() {
  const [name, setName] = useState("");
  const { createRoom, loadingStates, error } = useRoomStore();

  const isCreating = loadingStates.creatingRoom;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isCreating) return;
    
    try {
      const room = await createRoom(name);
      setName("");
      
      if (room) {
        window.location.href = `/room/${room.id}`;
      }
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter room name (e.g., Team Chat, Book Club)"
              disabled={isCreating}
              className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              maxLength={50}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <div className={`w-2 h-2 rounded-full ${
                isCreating ? 'bg-warning animate-pulse' : 'bg-primary animate-pulse'
              }`}></div>
            </div>
          </div>
          <button
            type="submit"
            disabled={!name.trim() || isCreating}
            className="px-8 py-3 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground rounded-xl transition-all duration-200 font-medium hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                <span>Create Room</span>
                <span className="text-lg">+</span>
              </>
            )}
          </button>
        </div>
        
        {error && (
          <div className="p-3 bg-error/10 border border-error/20 rounded-lg">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}
        
        <p className="text-sm text-muted-foreground">
          Create a space for your team, friends, or community to chat in real-time.
          {isCreating && (
            <span className="block mt-1 text-warning font-medium">
              Creating your room... This will appear instantly!
            </span>
          )}
        </p>
      </form>
    </div>
  );
}
