import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      hydrated: false,
      user: null,     // فيه role من الباك: 'admin' | 'technicien' | 'client'
      token: null,

      login: ({ user, token }) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      setUser: (user) => set({ user }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "7rify-auth",
      partialize: (s) => ({ user: s.user, token: s.token }),
      onRehydrateStorage: () => (state) => state?.setHydrated?.(),
    }
    
  )
);
