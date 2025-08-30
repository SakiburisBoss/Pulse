import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { sendMessage as sendMessageAction } from "@/actions/message";
import { createRoom as createRoomAction } from "@/actions/room";

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

interface Room {
  id: string;
  name: string;
  createdAt: Date;
}

interface CachedRoom extends Room {
  lastActivity?: Date;
  memberCount?: number;
  messageCount?: number;
  isOptimistic?: boolean;
}

interface QueuedMessage {
  tempId: string;
  roomId: string;
  text: string;
  userId: string;
  timestamp: number;
  retryCount: number;
}

type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'failed';

interface LoadingStates {
  sendingMessage: Record<string, boolean>;
  creatingRoom: boolean;
  loadingMessages: Record<string, boolean>;
}

type State = {
  messagesByRoom: Record<string, MessageWithUser[]>;
  messageQueue: QueuedMessage[];
  isProcessingQueue: boolean;
  rooms: CachedRoom[];
  roomsLastFetched: number | null;
  isConnected: boolean;
  connectionState: ConnectionState;
  error: string | null;
  lastSync: number | null;
  loadingStates: LoadingStates;
};

type Actions = {
  setMessages: (roomId: string, messages: MessageWithUser[]) => void;
  addMessage: (message: MessageWithUser) => void;
  sendMessage: (roomId: string, text: string, userId: string) => Promise<void>;
  addToMessageQueue: (roomId: string, text: string, userId: string) => string;
  removeFromMessageQueue: (tempId: string) => void;
  processMessageQueue: () => Promise<void>;
  setRooms: (rooms: CachedRoom[]) => void;
  addRoom: (room: CachedRoom) => void;
  createRoom: (name: string) => Promise<Room>;
  invalidateRoomsCache: () => void;
  invalidateMessagesCache: (roomId?: string) => void;
  updateLastSync: () => void;
  setConnectionState: (state: ConnectionState) => void;
  setError: (error: string | null) => void;
  setLoadingState: (key: string, loading: boolean, type: 'message' | 'room' | 'messages') => void;
  subscribeToRoom: (roomId: string) => void;
  unsubscribeFromRoom: (roomId: string) => void;
};

const ROOMS_CACHE_TTL = 30000; // 30 seconds
const MESSAGES_CACHE_TTL = 60000; // 1 minute
const MAX_RETRIES = 3;

export const useRoomStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      messagesByRoom: {},
      messageQueue: [],
      isProcessingQueue: false,
      rooms: [],
      roomsLastFetched: null,
      isConnected: false,
      connectionState: 'disconnected',
      error: null,
      lastSync: null,
      loadingStates: {
        sendingMessage: {},
        creatingRoom: false,
        loadingMessages: {},
      },

      setMessages: (roomId, messages) => set((state) => ({
        messagesByRoom: {
          ...state.messagesByRoom,
          [roomId]: messages
            .filter(m => !m.isOptimistic)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        }
      })),

      addMessage: (message) => set((state) => {
        const roomMessages = state.messagesByRoom[message.roomId] || [];
        
        // Remove optimistic message if this is the confirmed version
        let updatedMessages = roomMessages;
        if (message.tempId) {
          updatedMessages = roomMessages.filter(m => m.tempId !== message.tempId);
        }
        
        // Check for duplicates
        if (updatedMessages.some(m => m.id === message.id)) {
          return state;
        }
        
        return {
          messagesByRoom: {
            ...state.messagesByRoom,
            [message.roomId]: [...updatedMessages, message].sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )
          }
        };
      }),

      addToMessageQueue: (roomId, text, userId) => {
        const tempId = `temp_${Date.now()}_${Math.random()}`;
        const queuedMessage: QueuedMessage = {
          tempId,
          roomId,
          text,
          userId,
          timestamp: Date.now(),
          retryCount: 0
        };

        set((state) => ({
          messageQueue: [...state.messageQueue, queuedMessage]
        }));

        return tempId;
      },

      removeFromMessageQueue: (tempId) => set((state) => ({
        messageQueue: state.messageQueue.filter(m => m.tempId !== tempId)
      })),

      processMessageQueue: async () => {
        const state = get();
        if (state.isProcessingQueue || state.messageQueue.length === 0) {
          return;
        }

        set({ isProcessingQueue: true });

        const message = state.messageQueue[0];
        
        try {
          // Set loading state
          set((state) => ({
            loadingStates: {
              ...state.loadingStates,
              sendingMessage: {
                ...state.loadingStates.sendingMessage,
                [message.tempId]: true
              }
            }
          }));

          const realMessage = await sendMessageAction(message.roomId, message.text);
          
          // Remove from queue
          get().removeFromMessageQueue(message.tempId);
          
          // Update optimistic message with real data
          set((state) => {
            const roomMessages = state.messagesByRoom[message.roomId] || [];
            const updatedMessages = roomMessages.map(m => 
              m.tempId === message.tempId 
                ? { ...realMessage, user: realMessage.user }
                : m
            );

            const newSendingState = { ...state.loadingStates.sendingMessage };
            delete newSendingState[message.tempId];

            return {
              messagesByRoom: {
                ...state.messagesByRoom,
                [message.roomId]: updatedMessages
              },
              loadingStates: {
                ...state.loadingStates,
                sendingMessage: newSendingState
              }
            };
          });

          // Process next message after delay
          setTimeout(() => {
            set({ isProcessingQueue: false });
            get().processMessageQueue();
          }, 100);

        } catch (error) {
          console.error('Failed to send message:', error);
          
          // Handle retry logic
          if (message.retryCount < MAX_RETRIES) {
            set((state) => ({
              messageQueue: state.messageQueue.map(m => 
                m.tempId === message.tempId 
                  ? { ...m, retryCount: m.retryCount + 1 }
                  : m
              )
            }));
            
            // Retry with exponential backoff
            setTimeout(() => {
              set({ isProcessingQueue: false });
              get().processMessageQueue();
            }, 1000 * Math.pow(2, message.retryCount));
          } else {
            // Remove failed message after max retries
            get().removeFromMessageQueue(message.tempId);
            
            set((state) => {
              const newSendingState = { ...state.loadingStates.sendingMessage };
              delete newSendingState[message.tempId];

              return {
                messagesByRoom: {
                  ...state.messagesByRoom,
                  [message.roomId]: state.messagesByRoom[message.roomId]?.filter(
                    m => m.tempId !== message.tempId
                  ) || []
                },
                loadingStates: {
                  ...state.loadingStates,
                  sendingMessage: newSendingState
                },
                error: 'Failed to send message after multiple retries'
              };
            });

            set({ isProcessingQueue: false });
            get().processMessageQueue();
          }
        }
      },

      sendMessage: async (roomId, text, userId) => {
        const tempId = get().addToMessageQueue(roomId, text, userId);
        
        // Add optimistic message immediately
        const optimisticMessage: MessageWithUser = {
          id: tempId,
          roomId,
          userId,
          text,
          createdAt: new Date(),
          isOptimistic: true,
          tempId,
          user: null
        };

        set((state) => ({
          messagesByRoom: {
            ...state.messagesByRoom,
            [roomId]: [...(state.messagesByRoom[roomId] || []), optimisticMessage]
          }
        }));

        // Start processing queue
        get().processMessageQueue();
      },

      setRooms: (rooms) => set({
        rooms,
        roomsLastFetched: Date.now()
      }),

      addRoom: (room) => set((state) => {
        if (state.rooms.some(r => r.id === room.id)) {
          return state;
        }
        
        return {
          rooms: [room, ...state.rooms].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        };
      }),

      createRoom: async (name) => {
        const tempId = `temp_room_${Date.now()}`;
        
        const optimisticRoom: CachedRoom = {
          id: tempId,
          name,
          createdAt: new Date(),
          isOptimistic: true,
          memberCount: 1,
          messageCount: 0
        };

        set((state) => ({
          rooms: [optimisticRoom, ...state.rooms],
          loadingStates: {
            ...state.loadingStates,
            creatingRoom: true
          }
        }));

        try {
          const realRoom = await createRoomAction(name);
          
          set((state) => ({
            rooms: [
              {
                id: realRoom.id,
                name: realRoom.name,
                createdAt: realRoom.createdAt,
                memberCount: 1,
                messageCount: 0
              },
              ...state.rooms.filter(r => r.id !== tempId)
            ],
            loadingStates: {
              ...state.loadingStates,
              creatingRoom: false
            }
          }));
          
          return realRoom;
        } catch (error) {
          set((state) => ({
            rooms: state.rooms.filter(r => r.id !== tempId),
            loadingStates: {
              ...state.loadingStates,
              creatingRoom: false
            },
            error: error instanceof Error ? error.message : 'Failed to create room'
          }));
          throw error;
        }
      },

      invalidateRoomsCache: () => set({ roomsLastFetched: null }),
      
      invalidateMessagesCache: (roomId) => set((state) => {
        if (roomId) {
          const newMessagesByRoom = { ...state.messagesByRoom };
          delete newMessagesByRoom[roomId];
          return { messagesByRoom: newMessagesByRoom };
        }
        return { messagesByRoom: {} };
      }),

      updateLastSync: () => set({ lastSync: Date.now() }),

      setConnectionState: (connectionState) => set((state) => ({
        connectionState,
        isConnected: connectionState === 'connected',
        error: connectionState === 'connected' ? null : state.error
      })),

      setError: (error) => set({ error }),

      setLoadingState: (key, loading, type) => set((state) => {
        const loadingStates = { ...state.loadingStates };
        
        if (type === 'message') {
          loadingStates.sendingMessage = {
            ...loadingStates.sendingMessage,
            [key]: loading
          };
          if (!loading) {
            delete loadingStates.sendingMessage[key];
          }
        } else if (type === 'messages') {
          loadingStates.loadingMessages = {
            ...loadingStates.loadingMessages,
            [key]: loading
          };
          if (!loading) {
            delete loadingStates.loadingMessages[key];
          }
        } else if (type === 'room') {
          loadingStates.creatingRoom = loading;
        }
        
        return { loadingStates };
      }),

      subscribeToRoom: (roomId) => {
        console.log(`Subscribing to room: ${roomId}`);
      },

      unsubscribeFromRoom: (roomId) => {
        console.log(`Unsubscribing from room: ${roomId}`);
      },
    }),
    {
      name: 'pulse-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        messagesByRoom: state.messagesByRoom,
        rooms: state.rooms,
        roomsLastFetched: state.roomsLastFetched,
      }),
    }
  )
);

export const isRoomsCacheValid = () => {
  const state = useRoomStore.getState();
  return state.roomsLastFetched && (Date.now() - state.roomsLastFetched < ROOMS_CACHE_TTL);
};

export const isMessagesCacheValid = (roomId: string) => {
  const state = useRoomStore.getState();
  return state.messagesByRoom[roomId] && state.lastSync && (Date.now() - state.lastSync < MESSAGES_CACHE_TTL);
};
