import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { motion } from "framer-motion";

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
            <Outlet />
          </motion.div>
        </main>

        {/* Optional Right Sidebar for Trending/Recommendations */}
        <aside className="hidden xl:flex flex-col w-80 h-[calc(100vh-4rem)] sticky top-16 p-6 space-y-6">
          <div className="p-6 rounded-2xl bg-card border border-border/50 space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
              Trending Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {["Rust", "Next.js", "AI", "Infrastructure", "Web3"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-muted text-xs font-medium hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                  >
                    #{tag}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
            <h3 className="font-bold text-sm text-primary">SkillBridge Tip</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Developers with 3+ verified projects are <b>5x more likely</b> to
              get direct hiring requests.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
