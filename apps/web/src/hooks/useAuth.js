// apps/web/src/hooks/useAuth.js
import { create } from "zustand"; // Using Zustand for simple, reactive state
import { persist } from "zustand/middleware";

export const useAuth = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: true, isLoading: false }),
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem("auth-storage");
        window.location.href = "/auth/login";
      },
      checkAuth: () => {
        // Logic to verify token expiration or fetch current profile
        set({ isLoading: false });
      },
    }),
    { name: "auth-storage" },
  ),
);
