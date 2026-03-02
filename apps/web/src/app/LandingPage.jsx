import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowRight,
  Zap,
  Shield,
  Globe,
  Terminal,
  Cpu,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0A0A0A] font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Subtle Dot Matrix Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto backdrop-blur-md bg-white/50 border-b border-zinc-200">
        <div className="text-xl font-bold tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shadow-sm">
            <Cpu className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="tracking-widest uppercase text-sm font-black">
            Skill<span className="text-emerald-600">Bridge</span>
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

      {/* Hero Section */}
      <section className="relative z-10 px-8 pt-32 pb-20 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          Protocol v3.0 Is Live
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-9xl font-black leading-[0.85] tracking-tighter uppercase italic text-black"
        >
          Scale <br />{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
            Intelligence.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 max-w-xl text-lg md:text-xl font-medium text-zinc-500 leading-relaxed"
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
            <button className="group relative w-full sm:w-auto bg-black text-white text-sm font-bold uppercase tracking-widest px-10 py-5 rounded-full hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/20">
              Create Profile
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <button className="px-10 py-5 text-sm font-bold uppercase tracking-widest text-black border border-zinc-200 rounded-full hover:bg-white hover:border-zinc-400 transition-all">
            Hire Talent
          </button>
        </motion.div>
      </section>

      {/* Modern Bento Grid Features */}
      <section className="relative z-10 px-8 py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Large Card */}
          <div className="md:col-span-2 p-10 rounded-[2.5rem] border border-zinc-200 bg-white hover:border-emerald-500/30 transition-all group shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
              <Terminal className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight mb-2">
              Advanced Feed
            </h3>
            <p className="text-zinc-500 text-sm leading-relaxed font-medium">
              Proprietary ranking algorithms to show you the most relevant
              engineering posts and jobs first.
            </p>
          </div>

          <div className="p-10 rounded-[2.5rem] border border-zinc-200 bg-white flex flex-col justify-between shadow-sm">
            <Layers className="w-6 h-6 text-emerald-600" />
            <div>
              <div className="text-4xl font-black tracking-tighter italic">
                10K+
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Active Nodes
              </div>
            </div>
          </div>

          <div className="p-10 rounded-[2.5rem] border border-zinc-200 bg-emerald-600 flex flex-col justify-between hover:scale-[1.02] transition-all group cursor-default shadow-lg shadow-emerald-200">
            <Globe className="w-6 h-6 text-white" />
            <div>
              <div className="text-4xl font-black tracking-tighter text-white italic">
                2.4K
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-emerald-100">
                Deployments
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="relative z-10 px-8 py-12 border-t border-zinc-100 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <span className="text-[10px] font-black tracking-[0.4em] uppercase text-zinc-400">
          Built for the future of work © 2026
        </span>
        <div className="flex items-center gap-6 grayscale opacity-50 hover:opacity-100 transition-all">
          <div className="text-xs font-bold uppercase tracking-widest">
            Global Ops
          </div>
          <div className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
          </div>
        </div>
      </footer>
    </div>
  );
}
