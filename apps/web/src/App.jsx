// apps/web/src/App.jsx
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { router } from "@/app/router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

function App() {
  const { checkAuth } = useAuth();

  // Handle initial auth state hydration
  useEffect(() => {
    // Optional: Add logic to check if existing token in localStorage is valid
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
