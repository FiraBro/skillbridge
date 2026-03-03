import { create } from "zustand";
import { persist } from "zustand/middleware";

const setCookie = (name, value, days = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
};

export const useAuth = create()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true, // Starts true

      setAuth: (user, token) => {
        if (token) {
          localStorage.setItem("sb_token", token);
          setCookie("token", token);
        }
        if (user) {
          localStorage.setItem("sb_user", JSON.stringify(user));
        }
        set({
          user,
          token,
          isAuthenticated: !!(user && token),
          isLoading: false,
        });
      },

      logout: () => {
        localStorage.removeItem("sb_token");
        localStorage.removeItem("sb_user");
        deleteCookie("token");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        window.location.href = "/auth/login";
      },

      // This is now an internal helper for manual refreshes
      hydrate: () => {
        const token = localStorage.getItem("sb_token");
        const userJson = localStorage.getItem("sb_user");

        if (token && userJson) {
          try {
            const user = JSON.parse(userJson);
            setCookie("token", token);
            set({ user, token, isAuthenticated: true, isLoading: false });
          } catch (e) {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } else {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      // CRITICAL: This ensures isLoading becomes false after Zustand reads from LocalStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hydrate(); // Run the logic to sync cookies and state
        }
      },
    },
  ),
);
