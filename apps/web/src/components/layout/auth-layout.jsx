import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineCodeBracket } from "react-icons/hi2";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 flex flex-col relative overflow-hidden">
      {/* Background Decorative Elements (Subtle Gradients) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] dark:bg-blue-500/5" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] dark:bg-indigo-500/5" />
      </div>

      {/* Header / Navigation */}
      <nav className="relative z-50 p-6 flex items-center justify-between w-full backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary p-2.5 shadow-lg shadow-primary/20">
            <HiOutlineCodeBracket className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight leading-none">
              Skillbridge
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
              Dev Network
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-xs font-medium text-muted-foreground">
              Professional Environment
            </span>
            <span className="text-[10px] text-primary">v1.0.4-stable</span>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center relative z-10 px-4 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
            className="w-full max-w-[440px]"
          >
            {/* The Login/Register Cards render here */}
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-8 border-t border-border/40 bg-background/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Skillbridge Inc. Built for
            developers by developers.
          </p>
          <div className="flex gap-6 text-xs font-medium text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
