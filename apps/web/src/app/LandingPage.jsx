import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, Sparkles, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useSpring, useMotionValue } from "framer-motion";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  // Mouse Tracking - Increased Sensitivity for "Big Move" feel
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for that premium "liquid" movement
  const springX = useSpring(mouseX, { stiffness: 60, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Calculate offset from center and amplify for background movement
      const x = (e.clientX - window.innerWidth / 2) * 0.15;
      const y = (e.clientY - window.innerHeight / 2) * 0.15;
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
      {/* 1. LARGE INTERACTIVE DOT GRID */}
      {/* Increased dot size to 2px and made them more prominent */}
      <motion.div
        style={{ x: springX, y: springY, scale: 1.1 }}
        className="fixed inset-0 bg-[radial-gradient(#3b82f6_2px,transparent_2px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.35] pointer-events-none"
      />

      {/* 2. TOP NAVIGATION (Fixed Height) */}
      <nav className="relative z-50 flex-none flex items-center justify-between px-10 py-6 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="h-5 w-1 bg-blue-600 rounded-full" />
          <span className="tracking-[0.4em] uppercase text-[10px] font-black italic">
            Skill<span className="text-blue-600">Bridge</span>
          </span>
        </div>

        <div className="flex items-center gap-8">
          <Link
            to="/auth/login"
            className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-blue-600 transition-colors"
          >
            Access Port
          </Link>
          <Link to="/auth/register">
            <Button className="rounded-none bg-black text-white hover:bg-blue-600 font-black uppercase px-6 h-10 text-[9px] tracking-widest border-b-4 border-blue-900 active:border-b-0 active:translate-y-1 transition-all">
              Initialize
            </Button>
          </Link>
        </div>
      </nav>

      {/* 3. MAIN CENTER CONTENT (Perfectly Centered) */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 -mt-10"
      >
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mb-8 flex items-center gap-2 px-5 py-1.5 rounded-full border-2 border-blue-100 bg-white shadow-xl shadow-blue-500/10"
        >
          <Fingerprint className="w-3 h-3 text-blue-600" />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-blue-600 italic">
            Protocol v1.0.4 Online
          </span>
        </motion.div>

        {/* TYPOGRAPHY WITH STABLE GAP */}
        <div className="flex flex-col items-center select-none leading-none">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-7xl md:text-[8.5rem] font-black tracking-tighter uppercase italic text-black mb-10"
          >
            Scale
          </motion.h1>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-7xl md:text-[8.5rem] font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-500 to-sky-400"
          >
            Intelligence.
          </motion.h1>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 max-w-sm text-[10px] font-bold text-zinc-400 uppercase tracking-[0.5em] leading-loose"
        >
          An architectural bridge for elite talent <br /> and high-velocity
          engineering.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-14"
        >
          <Link to="/auth/register">
            <motion.button
              whileHover={{ scale: 1.05, letterSpacing: "0.6em" }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.4em] px-16 py-6 rounded-none flex items-center gap-3 transition-all shadow-2xl shadow-blue-600/30"
            >
              Start Deployment <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </motion.div>
      </motion.main>

      {/* 4. FOOTER (Guaranteed Visibility) */}
      <footer className="relative z-50 flex-none px-10 py-8 w-full max-w-7xl mx-auto flex justify-between items-end border-t border-zinc-100 bg-white/50 backdrop-blur-md">
        <div className="space-y-3">
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
                className="h-1.5 w-1.5 rounded-full bg-blue-600"
              />
            ))}
          </div>
          <div className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-300 italic underline decoration-blue-500/30 underline-offset-4">
            SkillBridge Cluster © 2026
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">
              Operational Status
            </span>
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </div>
          <div className="h-[2px] w-32 bg-gradient-to-r from-transparent via-blue-400 to-blue-600" />
        </div>
      </footer>
    </div>
  );
}
