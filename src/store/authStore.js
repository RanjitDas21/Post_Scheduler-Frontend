import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "../api/endpoints.js";
import { registerAuthHooks } from "../api/client.js";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      initializing: true,

      login: async (credentials) => {
        const { data } = await authApi.login(credentials);
        set({ user: data.user, token: data.token });
        return data.user;
      },

      signup: async (details) => {
        const { data } = await authApi.signup(details);
        set({ user: data.user, token: data.token });
        return data.user;
      },

      logout: () => {
        set({ user: null, token: null });
      },

      // Verifies the persisted token is still valid on app load and
      // refreshes the cached user object.
      initialize: async () => {
        const { token } = get();
        if (!token) {
          set({ initializing: false });
          return;
        }
        try {
          const { data } = await authApi.me();
          set({ user: data.user, initializing: false });
        } catch {
          set({ user: null, token: null, initializing: false });
        }
      },
    }),
    {
      name: "loop-auth", // localStorage key
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

// Wire the axios client to this store without a circular import.
registerAuthHooks(
  () => useAuthStore.getState().token,
  () => useAuthStore.getState().logout()
);
