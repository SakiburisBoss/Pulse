"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRoomStore } from '@/stores/store';
import { getAblyClient } from '@/lib/ablyClient';
import type Ably from 'ably';

interface MessageWithUser {
  id: string;
  roomId: string;
  userId: string;
  text: string;
  createdAt: Date;
  user?: {
    id: string;
    name?: string | null;
    image?: string | null;
  } | null;
  isOptimistic?: boolean;
  tempId?: string;
}

interface UseAblyRealtimeReturn {
  publishMessage: (message: MessageWithUser) => Promise<void>;
  isConnected: boolean;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'failed';
}

export function useAblyRealtime(roomId: string): UseAblyRealtimeReturn {
  const [channel, setChannel] = useState<Ably.RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'failed'>('disconnected');
  
  const { addMessage, setError } = useRoomStore();
  const cleanup = useRef<(() => void) | null>(null);
  const clientRef = useRef<Ably.Realtime | null>(null);

  const initializeAbly = useCallback(async () => {
    try {
      setConnectionState('connecting');
      
      // Use your existing getAblyClient function
      const ablyClient = getAblyClient();
      clientRef.current = ablyClient;

      // Handle connection state changes
      ablyClient.connection.on('connected', () => {
        console.log('Connected to Ably');
        setConnectionState('connected');
        setIsConnected(true);
        setError(null);
      });

      ablyClient.connection.on('disconnected', () => {
        console.log('Disconnected from Ably');
        setConnectionState('disconnected');
        setIsConnected(false);
      });

      ablyClient.connection.on('failed', (stateChange: Ably.ConnectionStateChange) => {
        console.error('Ably connection failed:', stateChange.reason);
        setConnectionState('failed');
        setIsConnected(false);
        setError(`Connection failed: ${stateChange.reason?.message || 'Unknown error'}`);
      });

      ablyClient.connection.on('suspended', () => {
        console.log('Ably connection suspended');
        setConnectionState('disconnected');
        setIsConnected(false);
      });

      // Get the channel
      const roomChannel = ablyClient.channels.get(`room:${roomId}`);

      // Subscribe to messages
      roomChannel.subscribe('message', (message: Ably.Message) => {
        const messageData = message.data as MessageWithUser;
        console.log('Received message:', messageData);
        
        addMessage({
          ...messageData,
          createdAt: new Date(messageData.createdAt)
        });
      });

      // Subscribe to message confirmations (for optimistic UI)
      roomChannel.subscribe('message:confirmed', (message: Ably.Message) => {
        const messageData = message.data as MessageWithUser & { tempId?: string };
        console.log('Message confirmed:', messageData);
        
        addMessage({
          ...messageData,
          createdAt: new Date(messageData.createdAt)
        });
      });

      setChannel(roomChannel);

      // Setup cleanup function
      cleanup.current = () => {
        roomChannel.unsubscribe();
        ablyClient.close();
      };

    } catch (error) {
      console.error('Failed to initialize Ably:', error);
      setConnectionState('failed');
      setError(error instanceof Error ? error.message : 'Failed to connect');
    }
  }, [roomId, addMessage, setError]);

  const publishMessage = useCallback(async (message: MessageWithUser) => {
    if (!channel || !isConnected) {
      throw new Error('Not connected to room');
    }

    try {
      await channel.publish('message:confirmed', {
        ...message,
        createdAt: message.createdAt.toISOString()
      });
    } catch (error) {
      console.error('Failed to publish message:', error);
      throw error;
    }
  }, [channel, isConnected]);

  useEffect(() => {
    initializeAbly();

    return () => {
      if (cleanup.current) {
        cleanup.current();
      }
    };
  }, [initializeAbly]);

  return {
    publishMessage,
    isConnected,
    connectionState
  };
}
