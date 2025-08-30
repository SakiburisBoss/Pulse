"use client";

import { approveRequest } from "@/actions/room";
import Avatar from "./Avatar";
import type { JoinRequest, User } from "@prisma/client";

export default function RoomJoinRequests({
  initialRequests,
}: {
  roomId: string;
  initialRequests: (JoinRequest & { user: User })[];
}) {
  return (
    <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-lg shadow-black/5">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-foreground flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-warning/20 to-warning/10 rounded-lg flex items-center justify-center">
            <span className="text-warning text-sm">🔔</span>
          </div>
          Join Requests
        </h2>
        <span className="text-sm bg-warning/10 text-warning px-3 py-1 rounded-full font-medium">
          {initialRequests.length}
        </span>
      </div>

      {initialRequests.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-muted-foreground">🔔</span>
          </div>
          <p className="text-sm">No pending requests</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {initialRequests.map((request, index) => (
            <li
              key={request.id}
              className="flex items-center justify-between p-3 bg-warning/5 border border-warning/20 rounded-xl animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center space-x-3">
                <Avatar 
                  src={request.user.image}
                  size={40}
                  name={request.user.name ?? "Guest"}
                  alt={`${request.user.name ?? "Guest"} avatar`}
                />
                <span className="font-medium text-foreground">
                  {request.user.name ?? "Guest"}
                </span>
              </div>
              
              <button
                onClick={() => approveRequest(request.id)}
                className="text-xs px-3 py-1.5 bg-success/10 hover:bg-success/20 text-success rounded-lg transition-colors duration-200 font-medium"
              >
                Approve
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
