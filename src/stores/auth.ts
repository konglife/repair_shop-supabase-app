import { defineStore } from 'pinia';
import { supabase } from '../supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    session: null as Session | null,
    loading: true,
  }),
  getters: {
    isLoggedIn: (state) => !!state.user,
  },
  actions: {
    async signInWithPassword(email: string, password: string) {
      this.loading = true;
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Login error:', error);
        this.user = null;
        this.session = null;
        throw error;
      }
      this.user = data.user;
      this.session = data.session;
      this.loading = false;
    },

    async signOut() {
      this.loading = true;
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        throw error;
      }
      this.user = null;
      this.session = null;
      this.loading = false;
    },

    async initializeAuth(): Promise<void> {
      this.loading = true;
      return new Promise<void>(async (resolve) => {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Get session error:', error);
          this.user = null;
          this.session = null;
        } else {
          this.session = session;
          this.user = session?.user ?? null;
        }

        // Listen for auth state changes
        supabase.auth.onAuthStateChange((_, _session) => {
          this.session = _session;
          this.user = _session?.user ?? null;
          this.loading = false; // Set loading to false after initial check and on subsequent changes
          resolve(); // Resolve the promise when auth state is determined
        });

        // If getSession already returned a session or error, and onAuthStateChange
        // doesn't fire immediately (which it might not if there's no session),
        // we should still resolve the promise.
        if (session || error) {
           this.loading = false;
           resolve();
        }
      });
    },
  },
});
