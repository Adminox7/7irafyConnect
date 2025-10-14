import { create } from "zustand";
import { persist } from "zustand/middleware";

// role: 'client' | 'technicien' | 'admin'
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      role: null,
      login: ({ user, token, role }) => {
        set({ user, token, role });
      },
      logout: () => {
        set({ user: null, token: null, role: null });
      },
    }),
    {
      // Persist under the requested key
      name: "7rify-auth",
      partialize: (state) => ({ user: state.user, token: state.token, role: state.role }),
    }
  )
);
