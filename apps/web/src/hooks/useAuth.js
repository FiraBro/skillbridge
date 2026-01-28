// apps/web/src/hooks/useAuth.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuth = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user, token) => {
        console.log(user, token);

        if (token) localStorage.setItem("sb_token", token);
        if (user) localStorage.setItem("sb_user", JSON.stringify(user));
        set({ user, token, isAuthenticated: true, isLoading: false });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem("sb_token");
        localStorage.removeItem("sb_user");
        localStorage.removeItem("auth-storage");
        window.location.href = "/auth/login";
      },

      hydrate: () => {
        const token = localStorage.getItem("sb_token");
        const userJson = localStorage.getItem("sb_user");

        if (token && userJson) {
          try {
            const user = JSON.parse(userJson);
            set({ user, token, isAuthenticated: true, isLoading: false });
          } catch (e) {
            set({ isLoading: false });
          }
        } else {
          set({ isLoading: false });
        }
      },
    }),
    { name: "auth-storage" },
  ),
);

// Auto-hydrate on load
if (typeof window !== "undefined") {
  useAuth.getState().hydrate();
}
