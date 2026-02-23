import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useJobDetail } from "@/hooks/useJobs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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

  const { data: job, isLoading, isError } = useJobDetail(id);

  if (isLoading) return <DetailSkeleton />;
  if (isError || !job) return <ErrorState navigate={navigate} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto p-6 md:p-12 space-y-10 text-gray-900 bg-gray-100"
    >
      {/* Back Button */}
      <Button
        variant="ghost"
        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
        onClick={() => navigate("/jobs")}
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Back to Jobs
      </Button>

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-8 border-b border-gray-300 pb-10">
        <div className="space-y-6 flex-1">
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight leading-[1.1] text-gray-900">
            {job.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-gray-700">
            <span className="flex items-center gap-2 text-xs uppercase tracking-wider">
              <Briefcase className="w-4 h-4" />
              {job.client_name}
            </span>
            <span className="flex items-center gap-2 text-xs">
              <DollarSign className="w-4 h-4" /> ${job.budget_range}
            </span>
            <span className="flex items-center gap-2 text-xs">
              <Calendar className="w-4 h-4" />{" "}
              {new Date(job.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <Badge className="rounded-full px-4 py-1 border border-gray-400 text-gray-800 font-bold flex items-center gap-1 bg-gray-200">
              <Globe className="w-3 h-3" /> Remote
            </Badge>
            {job.trial_friendly && (
              <Badge className="rounded-full px-4 py-1 border border-gray-400 text-gray-800 font-bold flex items-center gap-1 bg-gray-200">
                <Zap className="w-3 h-3" /> Trial Friendly
              </Badge>
            )}
          </div>
        </div>

        {/* Apply Button */}
        <div className="shrink-0 w-full lg:w-auto mt-4 lg:mt-0">
          <Button
            size="lg"
            className={`w-full lg:w-60 h-12 rounded-2xl font-bold text-lg transition-all active:scale-95 ${
              job.application_status
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-gray-800 text-white hover:bg-gray-700"
            }`}
            disabled={job.application_status !== null}
            onClick={() => navigate(`/jobs/${job.id}/apply`)}
          >
            {job.application_status !== null ? (
              <span className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6" /> Applied
              </span>
            ) : (
              "Submit Proposal"
            )}
          </Button>
          <p className="text-[11px] text-center mt-3 text-gray-600 font-medium uppercase tracking-widest">
            Requires 2 Connects
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left Content */}
        <div className="lg:col-span-8 space-y-12">
          {/* Description */}
          <section className="space-y-4">
            <h2 className="text-xs uppercase tracking-[0.2em] font-black text-gray-600 flex items-center gap-2">
              <Info className="w-4 h-4" /> Project Overview
            </h2>
            <div className="prose prose-gray max-w-none text-gray-800 leading-relaxed text-lg font-light">
              {job.description}
            </div>
          </section>

          {/* Expected Outcome */}
          {job.expected_outcome && (
            <section className="space-y-4">
              <h2 className="text-xs uppercase tracking-[0.2em] font-black text-gray-600">
                Goals & Outcomes
              </h2>
              <div className="p-6 bg-gray-200 rounded-2xl border border-gray-300">
                <p className="text-gray-900 font-serif italic text-lg leading-relaxed">
                  "{job.expected_outcome}"
                </p>
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          <Card className="p-6 border border-gray-300 rounded-2xl shadow-sm space-y-8 bg-gray-200">
            <div className="space-y-4">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-600">
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.required_skills?.[0]?.split(",").map((skill) => (
                  <Badge
                    key={skill}
                    className="rounded-lg bg-gray-300 text-gray-800 border-none font-bold text-[11px] py-1.5 px-3"
                  >
                    {skill.trim()}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-300 space-y-4">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-600">
                Client Verification
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="font-medium">Payment Verified</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Globe className="w-5 h-5" />
                  <span className="font-medium">Global Recruitment</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Pro Tip */}
          <div className="p-6 bg-gray-200 rounded-2xl border border-gray-300">
            <h4 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Zap className="w-3 h-3" /> Pro Tip
            </h4>
            <p className="text-sm text-gray-800 leading-relaxed">
              Tailor your proposal to the client's specific needs to increase
              your chance of selection.
            </p>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}

/* Skeleton Loader */
function DetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto p-12 space-y-12 animate-pulse">
      <Skeleton className="h-6 w-32 rounded-full bg-gray-300" />
      <div className="flex justify-between">
        <div className="space-y-4 w-2/3">
          <Skeleton className="h-20 w-full rounded-2xl bg-gray-300" />
          <Skeleton className="h-6 w-1/2 rounded-full bg-gray-300" />
        </div>
        <Skeleton className="h-16 w-64 rounded-2xl bg-gray-300" />
      </div>
      <div className="grid grid-cols-12 gap-12">
        <div className="col-span-8 space-y-6">
          <Skeleton className="h-64 w-full rounded-3xl bg-gray-300" />
        </div>
        <div className="col-span-4">
          <Skeleton className="h-80 w-full rounded-3xl bg-gray-300" />
        </div>
      </div>
    </div>
  );
}

/* Error State */
function ErrorState({ navigate }) {
  return (
    <div className="max-w-4xl mx-auto py-32 text-center space-y-6">
      <h2 className="text-3xl font-serif font-bold text-gray-900">
        Project Expired
      </h2>
      <p className="text-gray-700">
        This listing is no longer available or has been moved.
      </p>
      <Button
        onClick={() => navigate("/jobs")}
        className="rounded-full px-8 bg-gray-800 text-white hover:bg-gray-700"
      >
        Return to Jobs
      </Button>
    </div>
  );
}
