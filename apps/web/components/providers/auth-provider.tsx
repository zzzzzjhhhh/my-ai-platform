'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/utils/supabase/client';
import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

interface AuthState {
  session: Session | null;
  user: User | null;
  setSession: (session: Session | null) => void;
  checkUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  setSession: (session) => {
    set({ session, user: session?.user ?? null });
  },
  checkUser: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      get().setSession(null);
      return;
    }
    get().setSession(data.session);
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
    get().setSession(null); // Clear session in store regardless of Supabase error
  },
}));

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { checkUser, setSession } = useAuthStore();

  useEffect(() => {
    checkUser(); // Initial check

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [checkUser, setSession]);

  return <>{children}</>;
};

// Custom hook to use the auth store
export const useAuth = () => useAuthStore((state) => state); 