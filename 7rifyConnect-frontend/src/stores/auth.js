import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      hydrated: false,
      user: null,     // فيه role من الباك: 'admin' | 'technicien' | 'client'
      token: null,
      tokenCreatedAt: null,
      
      login: ({ user, token }) => set({ user, token, tokenCreatedAt: Date.now() }),
      logout: () => set({ user: null, token: null, tokenCreatedAt: null }),
      setUser: (user) => set({ user }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "7rify-auth",
      partialize: (s) => ({ user: s.user, token: s.token, tokenCreatedAt: s.tokenCreatedAt }),
      onRehydrateStorage: () => (state) => {
        const ttlMs = 1000 * 60 * 60 * 24 * 30; // 30 days
        if (state?.tokenCreatedAt && Date.now() - state.tokenCreatedAt > ttlMs) {
          state?.logout?.();
        }
        state?.setHydrated?.();
      },
    }
    
  )
);
