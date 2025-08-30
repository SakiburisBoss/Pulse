"use client";

import { useState } from "react";
import { joinRoom } from "@/actions/room";

export default function JoinRoomButton({ roomId }: { roomId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async () => {
    setIsLoading(true);
    try {
      await joinRoom(roomId);
    } catch (error) {
      console.error("Failed to join room:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleJoin}
      disabled={isLoading}
      className="px-6 py-2 bg-gradient-to-r from-success to-success/90 hover:from-success/90 hover:to-success text-white rounded-lg transition-all duration-200 font-medium hover:shadow-lg hover:shadow-success/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          Joining...
        </>
      ) : (
        <>
          <span>Join Room</span>
          <span className="text-sm">→</span>
        </>
      )}
    </button>
  );
}
