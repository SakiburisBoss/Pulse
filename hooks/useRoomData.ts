"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRoomStore, isRoomsCacheValid, isMessagesCacheValid } from '@/stores/store';
import { getRooms, getMessages } from '@/actions/room';

interface UseRoomDataOptions {
  roomId?: string;
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
}

export function useRoomData(options: UseRoomDataOptions = {}) {
  const {
    roomId,
    enableAutoRefresh = true,
    refreshInterval = 30000
  } = options;

  const {
    rooms,
    messagesByRoom,
    setRooms,
    setMessages,
    connectionState,
    setLoadingState,
    updateLastSync
  } = useRoomStore();

  const [isLoading, setIsLoading] = useState(false);

  const fetchRooms = useCallback(async (force = false) => {
    if (!force && isRoomsCacheValid()) {
      return;
    }

    setIsLoading(true);
    try {
      const fetchedRooms = await getRooms();
      setRooms(fetchedRooms);
      updateLastSync();
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setRooms, updateLastSync]);

  const fetchMessages = useCallback(async (targetRoomId: string, force = false) => {
    if (!force && isMessagesCacheValid(targetRoomId)) {
      return;
    }

    setLoadingState(targetRoomId, true, 'messages');
    try {
      const fetchedMessages = await getMessages(targetRoomId);
      setMessages(targetRoomId, fetchedMessages);
      updateLastSync();
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoadingState(targetRoomId, false, 'messages');
    }
  }, [setMessages, setLoadingState, updateLastSync]);

  useEffect(() => {
    if (!enableAutoRefresh || connectionState !== 'connected') return;

    const interval = setInterval(() => {
      fetchRooms();
      if (roomId) {
        fetchMessages(roomId);
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [enableAutoRefresh, connectionState, roomId, refreshInterval, fetchRooms, fetchMessages]);

  useEffect(() => {
    fetchRooms();
    if (roomId) {
      fetchMessages(roomId);
    }
  }, [roomId, fetchRooms, fetchMessages]);

  return {
    rooms,
    messages: roomId ? messagesByRoom[roomId] || [] : [],
    isLoading,
    fetchRooms,
    fetchMessages,
    refreshData: useCallback(() => {
      fetchRooms(true);
      if (roomId) fetchMessages(roomId, true);
    }, [fetchRooms, fetchMessages, roomId])
  };
}
