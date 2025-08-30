"use client";

import { deleteRoom } from "@/actions/room";
import { useState } from "react";

interface RoomCardDeleteButtonProps {
  roomId: string;
  roomName: string;
  isAdmin: boolean;
}

export default function RoomCardDeleteButton({
  roomId,
  roomName,
  isAdmin,
}: RoomCardDeleteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isAdmin) return null;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDeleting(true);
    try {
      await deleteRoom(roomId);
      // Reload the page to update the room list
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete room:", error);
      alert("Failed to delete room. Please try again.");
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  const openModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  return (
    <>
      {/* Compact Delete Button */}
      <button
        onClick={openModal}
        className="opacity-0 group-hover:opacity-100 p-1 text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-md transition-all duration-200"
        title="Delete Room"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>

      {/* Compact Confirmation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={(e) => {
              e.stopPropagation();
              if (!isDeleting) setIsOpen(false);
            }}
          />

          {/* Modal */}
          <div
            className="relative bg-card border border-border/50 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl shadow-black/25"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => !isDeleting && setIsOpen(false)}
              disabled={isDeleting}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors duration-200 disabled:opacity-50"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Content */}
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-destructive"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Delete Room?
                </h3>
                <p className="text-sm text-muted-foreground">
                  This will permanently delete{" "}
                  <span className="font-medium text-foreground">
                    #{roomName}
                  </span>{" "}
                  and all its data.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isDeleting}
                  className="flex-1 px-3 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition-colors duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-destructive hover:bg-destructive/90 disabled:bg-destructive/50 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
