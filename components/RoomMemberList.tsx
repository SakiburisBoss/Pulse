"use client";

import { promoteToAdmin } from "@/actions/room";
import Avatar from "./Avatar";
import type { RoomMember, User } from "@prisma/client";

export default function RoomMemberList({
  initialMembers,
  isAdmin,
}: {
  roomId: string;
  initialMembers: (RoomMember & { user: User })[];
  isAdmin: boolean;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border/50 p-6 shadow-lg shadow-black/5">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-foreground flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
            <span className="text-primary text-sm">👥</span>
          </div>
          Members
        </h2>
        <span className="text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
          {initialMembers.length}
        </span>
      </div>

      {initialMembers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-muted-foreground">👥</span>
          </div>
          <p className="text-sm">No members yet</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {initialMembers.map((member, index) => (
            <li
              key={member.id}
              className="flex items-center justify-between p-3 bg-accent/30 hover:bg-accent/50 rounded-xl transition-colors duration-200 animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center space-x-3">
                <Avatar 
                  src={member.user.image}
                  size={40}
                  name={member.user.name ?? "Guest"}
                  alt={`${member.user.name ?? "Guest"} avatar`}
                />
                <div>
                  <span className="font-medium text-foreground">
                    {member.user.name ?? "Guest"}
                  </span>
                  <div className="flex items-center space-x-2 mt-1">
                    {member.role === "ADMIN" && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                        Admin
                      </span>
                    )}
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                  </div>
                </div>
              </div>
              
              {isAdmin && member.role !== "ADMIN" && (
                <button
                  onClick={() => promoteToAdmin(member.id)}
                  className="text-xs px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors duration-200 font-medium"
                >
                  Promote
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
