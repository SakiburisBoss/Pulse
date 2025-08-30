"use client";

import { useEffect, useRef } from "react";
import { useRoomStore } from "@/stores/store";
import { useRoomData } from "@/hooks/useRoomData";
import { useAblyRealtime } from "@/hooks/useAblyRealtime";
import Avatar from "./Avatar";

interface MessageUser {
  id: string;
  name?: string | null;
  image?: string | null;
}

interface MessageWithUser {
  id: string;
  roomId: string;
  userId: string;
  text: string;
  createdAt: Date;
  user?: MessageUser | null;
  isOptimistic?: boolean;
  tempId?: string;
}

export default function ChatRoom({ roomId, initialMessages }: { 
  roomId: string; 
  initialMessages: MessageWithUser[] 
}) {
  const {
    messagesByRoom,
    sendMessage,
    connectionState,
    isConnected,
    error,
    loadingStates,
    setConnectionState,
    subscribeToRoom,
    setMessages,
    messageQueue,
    isProcessingQueue
  } = useRoomStore();

  const { refreshData } = useRoomData({ roomId });
  const { isConnected: ablyConnected } = useAblyRealtime(roomId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = messagesByRoom[roomId] || initialMessages;
  const pendingCount = messageQueue.filter(m => m.roomId === roomId).length;
  const actuallyConnected = isConnected && ablyConnected;

  useEffect(() => {
    if (initialMessages.length > 0 && !messagesByRoom[roomId]) {
      setMessages(roomId, initialMessages);
    }
  }, [roomId, initialMessages, messagesByRoom, setMessages]);

  useEffect(() => {
    subscribeToRoom(roomId);
    
    setConnectionState('connecting');
    
    const timer = setTimeout(() => {
      if (ablyConnected) {
        setConnectionState('connected');
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [roomId, subscribeToRoom, setConnectionState, ablyConnected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !actuallyConnected) return;
    
    try {
      await sendMessage(roomId, text, "me");
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getConnectionStatus = () => {
    switch (connectionState) {
      case 'connecting':
        return { color: 'bg-warning', text: 'Connecting...', pulse: true };
      case 'connected':
        return { color: 'bg-success', text: 'Connected', pulse: true };
      case 'disconnected':
        return { color: 'bg-muted-foreground', text: 'Disconnected', pulse: false };
      case 'failed':
        return { color: 'bg-error', text: 'Connection failed', pulse: false };
      default:
        return { color: 'bg-muted-foreground', text: 'Unknown', pulse: false };
    }
  };

  const connectionStatus = getConnectionStatus();

  return (
    <div className="flex flex-col h-[600px] bg-card rounded-2xl border border-border/50 shadow-xl shadow-black/5 overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center">
            <span className="text-white font-semibold">#</span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Room Chat</h3>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${connectionStatus.color} ${connectionStatus.pulse ? 'animate-pulse' : ''}`}></div>
              <span className="text-sm text-muted-foreground">
                {connectionStatus.text}
                {pendingCount > 0 && ` • ${pendingCount} pending`}
                {isProcessingQueue && ` • sending...`}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => refreshData()}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 p-1"
            title="Refresh"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <div className="text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
            {messages.length} messages
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-2 p-3 bg-error/10 border border-error/20 rounded-lg flex items-center justify-between">
          <p className="text-sm text-error">{error}</p>
          <button
            onClick={() => useRoomStore.getState().setError(null)}
            className="text-error hover:text-error/80"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center">
              <span className="text-primary text-2xl">💬</span>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Start the conversation</h4>
              <p className="text-sm text-muted-foreground">Be the first to send a message in this room!</p>
            </div>
          </div>
        ) : (
          messages.map((message: MessageWithUser, index: number) => {
            const displayName = message.user?.name || `User-${message.userId?.slice(-4) || '????'}`;
            const isOptimistic = message.isOptimistic || false;
            const isLoading = message.tempId && loadingStates.sendingMessage[message.tempId];
            
            return (
              <div
                key={message.tempId || message.id}
                className={`group animate-fade-in flex items-start space-x-3 ${
                  isOptimistic ? 'opacity-70' : 'opacity-100'
                } transition-opacity duration-200`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Avatar 
                  src={message.user?.image || null}
                  size={36}
                  name={displayName}
                  alt={`${displayName} avatar`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-foreground">
                      {displayName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.createdAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    {isLoading && (
                      <div className="w-3 h-3 border border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    )}
                    {isOptimistic && !isLoading && (
                      <span className="text-xs text-warning">Sending...</span>
                    )}
                  </div>
                  <div className={`bg-accent/50 hover:bg-accent/70 transition-colors duration-200 rounded-xl rounded-tl-none p-4 group-hover:shadow-sm ${
                    isOptimistic ? 'border border-dashed border-primary/30' : ''
                  }`}>
                    <p className="text-foreground break-words leading-relaxed">{message.text}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-border/50 bg-gradient-to-r from-transparent to-primary/5">
        <form
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const textInput = e.currentTarget.elements.namedItem("msg") as HTMLTextAreaElement;
            const text = textInput.value.trim();
            if (text) {
              handleSendMessage(text);
              textInput.value = "";
              textInput.style.height = "auto";
            }
          }}
          className="flex items-end p-4 space-x-3"
        >
          <div className="flex-1 relative">
            <textarea
              name="msg"
              rows={1}
              placeholder={actuallyConnected ? "Type your message..." : "Connecting..."}
              disabled={!actuallyConnected}
              className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground resize-none min-h-[48px] max-h-32 disabled:opacity-50 disabled:cursor-not-allowed"
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form?.dispatchEvent(new Event('submit', { bubbles: true }));
                }
              }}
              onInput={(e: React.FormEvent<HTMLTextAreaElement>) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!actuallyConnected || loadingStates.creatingRoom}
            className="px-6 py-3 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground rounded-xl transition-all duration-200 font-medium hover:shadow-lg hover:shadow-primary/25 flex items-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span>Send</span>
            <span className="text-sm">↗</span>
          </button>
        </form>
      </div>
    </div>
  );
}
