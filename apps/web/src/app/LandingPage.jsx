import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, Sparkles, Fingerprint, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useSpring, useMotionValue } from "framer-motion";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  // Mouse Tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX - window.innerWidth / 2) * 0.1;
      const y = (e.clientY - window.innerHeight / 2) * 0.1;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative h-screen w-full bg-[#FAFAFA] text-[#0A0A0A] font-sans overflow-hidden flex flex-col justify-between">
      {/* 1. INTERACTIVE DOT GRID (Hidden on mobile for performance/clarity, visible on md+) */}
      <motion.div
        style={{ x: springX, y: springY, scale: 1.1 }}
        className="fixed inset-0 bg-[radial-gradient(#3b82f6_2px,transparent_2px)] [background-size:32px_32px] md:[background-size:48px_48px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 md:opacity-[0.35] pointer-events-none"
      />

      {/* 2. TOP NAVIGATION */}
      <nav className="relative z-50 flex-none flex items-center justify-between px-6 md:px-10 py-6 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="h-4 md:h-5 w-1 bg-blue-600 rounded-full" />
          <span className="tracking-[0.3em] md:tracking-[0.4em] uppercase text-[9px] md:text-[10px] font-black italic">
            Skill<span className="text-blue-600">Bridge</span>
          </span>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <Link
            to="/auth/login"
            className="hidden sm:block text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-blue-600 transition-colors"
          >
            Access Port
          </Link>
          <Link to="/auth/register">
            <Button className="rounded-none bg-black text-white hover:bg-blue-600 font-black uppercase px-4 md:px-6 h-9 md:h-10 text-[8px] md:text-[9px] tracking-widest border-b-2 md:border-b-4 border-blue-900 transition-all">
              Initialize
            </Button>
          </Link>
        </div>
      </nav>

      {/* 3. MAIN CENTER CONTENT */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6"
      >
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mb-6 md:mb-8 flex items-center gap-2 px-4 py-1.5 rounded-full border-2 border-blue-100 bg-white shadow-lg shadow-blue-500/5"
        >
          <Fingerprint className="w-3 h-3 text-blue-600" />
          <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.3em] text-blue-600 italic">
            Protocol v1.0.4 Online
          </span>
        </motion.div>

        {/* RESPONSIVE TYPOGRAPHY */}
        <div className="flex flex-col items-center select-none leading-none w-full">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-[8.5rem] font-black tracking-tighter uppercase italic text-black mb-4 md:mb-10"
          >
            Scale
          </motion.h1>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-[8.5rem] font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-500 to-sky-400"
          >
            Intelligence.
          </motion.h1>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 md:mt-12 max-w-[280px] sm:max-w-sm text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] md:tracking-[0.5em] leading-loose"
        >
          Bridging elite talent with <br className="hidden sm:block" />{" "}
          high-velocity engineering.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-10 md:pt-14 w-full sm:w-auto"
        >
          <Link to="/auth/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto bg-blue-600 text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] px-10 md:px-16 py-5 md:py-6 rounded-none flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/20"
            >
              Start Deployment <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>
      </motion.main>

      {/* 4. FOOTER */}
      <footer className="relative z-50 flex-none px-6 md:px-10 py-6 md:py-8 w-full max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 sm:gap-0 border-t border-zinc-100 bg-white/50 backdrop-blur-md">
        <div className="flex flex-col items-center sm:items-start gap-3">
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-1 w-1 rounded-full bg-blue-600/40" />
            ))}
          </div>
          <div className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-zinc-300 italic">
            SkillBridge Cluster © 2026
          </div>
        </div>

        <div className="flex flex-col items-center sm:items-end gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-500">
              Status: Nominal
            </span>
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="hidden sm:block h-[1px] w-24 bg-gradient-to-r from-transparent via-blue-400 to-blue-600" />
        </div>
      </footer>
    </div>
  );
}
