"use client";

import { deleteRoom } from "@/actions/room";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeleteRoomButtonProps {
  roomId: string;
  roomName: string;
}

export default function DeleteRoomButton({
  roomId,
  roomName,
}: DeleteRoomButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const router = useRouter();

  const handleDelete = async () => {
    if (confirmText !== roomName) return;

    setIsDeleting(true);
    try {
      await deleteRoom(roomId);
      // Show success toast
      showToast("Room deleted successfully", "success");
      // Redirect to home after successful deletion
      setTimeout(() => router.push("/"), 1000);
    } catch (error) {
      console.error("Failed to delete room:", error);
      showToast("Failed to delete room. Please try again.", "error");
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 z-[60] p-4 rounded-lg text-white font-medium shadow-lg transition-all duration-300 ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    }`;
    toast.textContent = message;
    toast.style.transform = "translateX(400px)";
    document.body.appendChild(toast);

    // Slide in
    setTimeout(() => {
      toast.style.transform = "translateX(0)";
    }, 100);

    // Slide out and remove
    setTimeout(() => {
      toast.style.transform = "translateX(400px)";
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  return (
    <>
      {/* Delete Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-lg transition-all duration-200 border border-destructive/20 hover:border-destructive/30"
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
        Delete Room
      </button>

      {/* Confirmation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => !isDeleting && setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-card border border-border/50 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl shadow-black/25 animate-scale-in">
            {/* Close Button */}
            <button
              onClick={() => !isDeleting && setIsOpen(false)}
              disabled={isDeleting}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors duration-200 disabled:opacity-50"
            >
              <svg
                className="w-5 h-5"
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

            {/* Icon */}
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-destructive/10 rounded-full">
              <svg
                className="w-8 h-8 text-destructive"
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

            {/* Content */}
            <div className="text-center space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  Delete Room
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  This will permanently delete{" "}
                  <span className="font-semibold text-foreground">
                    #{roomName}
                  </span>{" "}
                  and all its messages, members, and data.
                </p>
                <p className="text-sm text-destructive/80 mt-2 font-medium">
                  This action cannot be undone.
                </p>
              </div>

              {/* Confirmation Input */}
              <div className="text-left space-y-3">
                <label className="block text-sm font-medium text-foreground">
                  Type{" "}
                  <span className="font-semibold text-destructive">
                    {roomName}
                  </span>{" "}
                  to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  disabled={isDeleting}
                  placeholder="Enter room name"
                  className="w-full px-4 py-3 bg-background border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-destructive/50 focus:border-destructive transition-all duration-200 disabled:opacity-50"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 text-sm font-medium text-foreground hover:text-foreground/80 hover:bg-accent/50 rounded-lg transition-all duration-200 border border-border/30 hover:border-border/50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting || confirmText !== roomName}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-destructive hover:bg-destructive/90 disabled:bg-destructive/50 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
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
                      Delete Forever
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
