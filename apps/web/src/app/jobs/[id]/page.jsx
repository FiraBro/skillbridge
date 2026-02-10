import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useJobDetail, useApplyJob } from "@/hooks/useJobs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  CheckCircle,
  Briefcase,
  DollarSign,
  Calendar,
  Zap,
  Globe,
  ShieldCheck,
  Info,
} from "lucide-react";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Destructure data from the response structure you provided
  const { data: response, isLoading, isError } = useJobDetail(id);

  // Extract the actual job object from the "data" property of the response
  const job = response?.data;

  if (isLoading) return <DetailSkeleton />;
  if (isError || !job) return <ErrorState navigate={navigate} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto p-6 md:p-12 space-y-10"
    >
      {/* Navigation */}
      <Button
        variant="ghost"
        className="group gap-2 pl-0 text-zinc-500 hover:text-zinc-900 transition-colors"
        onClick={() => navigate("/jobs")}
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Back to Dashboard
      </Button>

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-8 border-b border-zinc-100 dark:border-zinc-800 pb-10">
        <div className="space-y-6 flex-1">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.1]">
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-zinc-500">
              <span className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-xs">
                <Briefcase className="w-4 h-4 text-indigo-600" />{" "}
                {job.client_name}
              </span>
              <span className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> ${job.budget_range}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />{" "}
                {new Date(job.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="rounded-full px-4 py-1 border-zinc-200 text-zinc-600 font-bold"
            >
              <Globe className="w-3.5 h-3.5 mr-2" /> Remote
            </Badge>
            {job.trial_friendly && (
              <Badge className="rounded-full px-4 py-1 bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100 transition-colors">
                <Zap className="w-3.5 h-3.5 mr-2 fill-current" /> Trial Friendly
              </Badge>
            )}
          </div>
        </div>

        <div className="shrink-0 w-full lg:w-auto">
          <Button
            size="lg"
            className={`w-full lg:w-80 h-16 rounded-2xl font-bold text-xl transition-all active:scale-95 shadow-2xl shadow-zinc-200 dark:shadow-none ${
              job.application_status
                ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                : "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-800"
            }`}
            onClick={() => setIsApplyModalOpen(true)}
            disabled={job.application_status !== null}
          >
            {job.application_status !== null ? (
              <span className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6" /> Applied
              </span>
            ) : (
              "Submit Proposal"
            )}
          </Button>
          <p className="text-[11px] text-center mt-3 text-zinc-400 font-medium uppercase tracking-widest">
            Requires 2 Connects
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-12">
          {/* Description */}
          <section className="space-y-4">
            <h2 className="text-xs uppercase tracking-[0.2em] font-black text-zinc-400 flex items-center gap-2">
              <Info className="w-4 h-4" /> Project Overview
            </h2>
            <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 leading-relaxed text-xl font-light">
              {job.description}
            </div>
          </section>

          {/* Outcome */}
          {job.expected_outcome && (
            <section className="space-y-4">
              <h2 className="text-xs uppercase tracking-[0.2em] font-black text-zinc-400">
                Goals & Outcomes
              </h2>
              <div className="p-8 bg-zinc-50 dark:bg-zinc-900/40 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                <p className="text-zinc-900 dark:text-zinc-100 font-serif italic text-lg leading-relaxed">
                  "{job.expected_outcome}"
                </p>
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          <Card className="p-8 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm rounded-3xl space-y-8">
            <div className="space-y-4">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-400">
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {/* Fixed skill parsing for your array structure */}
                {job.required_skills?.[0]?.split(",").map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-none font-bold text-[11px] py-1.5 px-3"
                  >
                    {skill.trim()}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 space-y-6">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-400">
                Client Verification
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-zinc-600">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  <span className="font-medium">Payment Method Verified</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-zinc-600">
                  <Globe className="w-5 h-5 text-indigo-600" />
                  <span className="font-medium">Global Recruitment</span>
                </div>
              </div>
            </div>
          </Card>

          <div className="p-6 bg-indigo-50/50 dark:bg-indigo-950/10 rounded-3xl border border-indigo-100/50">
            <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
              <Zap className="w-3 h-3 fill-current" /> Pro Tip
            </h4>
            <p className="text-[13px] text-indigo-800/80 dark:text-indigo-400/80 leading-relaxed">
              Tailor your proposal to nexmart tech's specific landing page needs
              to increase your chance of selection.
            </p>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}

function DetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto p-12 space-y-12 animate-pulse">
      <Skeleton className="h-6 w-32 rounded-full" />
      <div className="flex justify-between">
        <div className="space-y-4 w-2/3">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-6 w-1/2 rounded-full" />
        </div>
        <Skeleton className="h-16 w-64 rounded-2xl" />
      </div>
      <div className="grid grid-cols-12 gap-12">
        <div className="col-span-8 space-y-6">
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
        <div className="col-span-4">
          <Skeleton className="h-80 w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

function ErrorState({ navigate }) {
  return (
    <div className="max-w-4xl mx-auto py-32 text-center space-y-6">
      <h2 className="text-3xl font-serif font-bold">Project Expired</h2>
      <p className="text-zinc-500">
        This listing is no longer available or has been moved.
      </p>
      <Button
        onClick={() => navigate("/jobs")}
        variant="outline"
        className="rounded-full px-8"
      >
        Return to Jobs
      </Button>
    </div>
  );
}
