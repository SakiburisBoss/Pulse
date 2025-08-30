"use client";

import { useState, useRef, useEffect } from 'react';
import { SignInButton } from '@clerk/nextjs';

export default function AuthDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleGuestContinue = () => {
    setIsOpen(false);
    // Scroll to rooms section or you can navigate to a specific route
    const roomsSection = document.getElementById('rooms');
    if (roomsSection) {
      roomsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-200 font-medium hover:shadow-lg hover:shadow-primary/25 flex items-center gap-2"
      >
        <span>Get Started</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-border/50 rounded-xl shadow-xl shadow-black/10 z-50 overflow-hidden animate-fade-in">
          <div className="p-2">
            <SignInButton>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-accent/50 rounded-lg transition-colors duration-200 text-left"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">Sign In with Account</h4>
                  <p className="text-sm text-muted-foreground">Save your rooms and get a permanent profile</p>
                </div>
              </button>
            </SignInButton>

            <div className="mx-4 my-2 border-t border-border/30"></div>

            <button
              onClick={handleGuestContinue}
              className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-accent/50 rounded-lg transition-colors duration-200 text-left"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-secondary/30 to-secondary/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-secondary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground">Continue as Guest</h4>
                <p className="text-sm text-muted-foreground">Start chatting immediately, no account needed</p>
              </div>
            </button>
          </div>

          <div className="px-6 py-3 bg-accent/30 border-t border-border/30">
            <p className="text-xs text-muted-foreground text-center">
              You can always create an account later to save your data
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
