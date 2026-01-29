// apps/web/src/App.jsx
import { RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { router } from "@/app/router";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const { checkAuth } = useAuth();

  // Handle initial auth state hydration
  useEffect(() => {
    // Optional: Add logic to check if existing token in localStorage is valid
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ToastContainer
        position="bottom-left"
        autoClose={4000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        draggable={false}
        pauseOnHover
        theme="light" // Set theme to light
        transition={Slide}
        toastClassName="!bg-[#f0f4f9] !rounded-full !shadow-md !border-none !min-h-[48px] !mb-6 !ml-4"
        bodyClassName="!p-0 !m-0"
      />
    </QueryClientProvider>
  );
}

export default App;
