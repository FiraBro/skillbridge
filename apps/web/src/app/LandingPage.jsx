import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative min-h-screen bg-[#FAFAFA] text-[#0A0A0A] font-sans overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      {/* Background Dot Matrix - Pinned to Viewport */}
      <div className="fixed inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Navigation - Absolute so it doesn't push the Hero down */}
      <nav className="absolute top-0 w-full z-50 flex items-center justify-between px-8 py-6 max-w-7xl left-1/2 -translate-x-1/2">
        <div className="text-xl font-bold tracking-tighter flex items-center gap-2">
          <span className="tracking-widest uppercase text-sm font-black">
            Skill<span className="text-blue-600">Bridge</span>
          </span>
        </div>
        <div className="flex items-center gap-8">
          <Link
            to="/auth/login"
            className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-black transition-colors"
          >
            Login
          </Link>
          <Link to="/auth/register">
            <Button className="rounded-full bg-black text-white hover:bg-zinc-800 font-bold uppercase px-6 text-xs tracking-widest transition-all active:scale-95 shadow-lg shadow-black/10">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section - EXACTLY SCREEN HEIGHT */}
      <section className="relative z-10 w-full h-screen flex flex-col items-center justify-center text-center px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          Protocol v3.0 Is Live
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-[10rem] font-black leading-[0.8] tracking-tighter uppercase italic text-black"
        >
          Scale <br />{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">
            Intelligence.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-10 max-w-xl text-lg md:text-xl font-medium text-zinc-500 leading-relaxed"
        >
          The architectural bridge connecting elite developers with the world's
          most ambitious engineering teams.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 pt-12"
        >
          <Link to="/auth/register">
            <button className="group relative w-full sm:w-auto bg-black text-white text-sm font-bold uppercase tracking-widest px-10 py-5 rounded-full hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/20">
              Create Profile
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <button className="px-10 py-5 text-sm font-bold uppercase tracking-widest text-black border border-zinc-200 rounded-full hover:bg-white hover:border-zinc-400 transition-all">
            Hire Talent
          </button>
        </motion.div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 animate-bounce">
          <div className="w-px h-12 bg-gradient-to-b from-blue-600 to-transparent mx-auto" />
        </div>
      </section>

      <footer className="relative z-10 px-8 py-12 border-t border-zinc-100 max-w-7xl mx-auto flex justify-between items-center">
        <span className="text-[10px] font-black tracking-[0.4em] uppercase text-zinc-400">
          SkillBridge © 2026
        </span>
        <div className="flex gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
        </div>
      </footer>
    </div>
  );
}
