import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { PageTransition } from "@/components/comman/PageTransition";
import { motion } from "framer-motion";
import "@/styles/auth.css";

export default function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex container max-w-7xl mx-auto items-start">
        <Sidebar />
        <main className="flex-1 min-w-0 py-6 px-4 md:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <PageTransition>
              <Outlet />
            </PageTransition>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
