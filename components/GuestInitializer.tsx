"use client";

import { useEffect } from 'react';
import { createGuestIdentity } from '@/actions/auth';

interface GuestInitializerProps {
  isTemporaryGuest: boolean;
}

export default function GuestInitializer({ isTemporaryGuest }: GuestInitializerProps) {
  useEffect(() => {
    if (isTemporaryGuest) {
      // Initialize guest identity when component mounts
      createGuestIdentity().then(() => {
        // Refresh the page to get the proper identity
        window.location.reload();
      }).catch(error => {
        console.error('Failed to create guest identity:', error);
      });
    }
  }, [isTemporaryGuest]);

  if (isTemporaryGuest) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-card rounded-2xl border border-border/50 p-8 shadow-xl shadow-black/5 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Setting up your guest session</h3>
          <p className="text-sm text-muted-foreground">Just a moment while we prepare everything for you...</p>
        </div>
      </div>
    );
  }

  return null;
}
