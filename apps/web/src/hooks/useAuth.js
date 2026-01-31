// apps/web/src/hooks/useAuth.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Helper function to set a cookie
const setCookie = (name, value, days = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
};

// Helper function to delete a cookie
const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
};

export const useAuth = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user, token) => {
        console.log(user, token);

        if (token) {
          localStorage.setItem("sb_token", token);
          // Also set the token in a cookie for API requests that need it
          setCookie("token", token);
        }
        if (user) localStorage.setItem("sb_user", JSON.stringify(user));
        set({ user, token, isAuthenticated: true, isLoading: false });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem("sb_token");
        localStorage.removeItem("sb_user");
        localStorage.removeItem("auth-storage");
        // Also remove the cookie
        deleteCookie("token");
        window.location.href = "/auth/login";
      },

      hydrate: () => {
        const token = localStorage.getItem("sb_token");
        const userJson = localStorage.getItem("sb_user");

        if (token && userJson) {
          try {
            const user = JSON.parse(userJson);
            // Also set the token in a cookie for API requests that need it
            setCookie("token", token);
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
