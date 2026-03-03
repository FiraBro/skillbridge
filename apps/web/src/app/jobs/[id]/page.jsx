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
      // Updated padding: p-4 for mobile, p-8 for tablet, p-12 for desktop
      className="max-w-5xl mx-auto p-4 md:p-8 lg:p-12 space-y-8 md:space-y-10 text-gray-900 bg-gray-50 min-h-screen"
    >
      {/* Back Button */}
      <Button
        variant="ghost"
        className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors p-0 md:p-2"
        onClick={() => navigate("/jobs")}
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span className="text-sm font-medium">Back to Jobs</span>
      </Button>

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6 md:gap-8 border-b border-gray-200 pb-8 md:pb-10">
        <div className="space-y-4 md:space-y-6 flex-1 w-full">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-serif font-bold tracking-tight leading-[1.2] text-gray-900">
            {job.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-3 text-xs md:text-sm font-medium text-gray-600">
            <span className="flex items-center gap-1.5 uppercase tracking-wider">
              <Briefcase className="w-4 h-4 text-gray-400" />
              {job.client_name}
            </span>
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-gray-400" /> $
              {job.budget_range}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-400" />{" "}
              {new Date(job.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Badge className="rounded-full px-3 py-1 border border-gray-300 text-gray-700 font-bold flex items-center gap-1 bg-white shadow-sm">
              <Globe className="w-3 h-3" /> Remote
            </Badge>
            {job.trial_friendly && (
              <Badge className="rounded-full px-3 py-1 border border-gray-300 text-gray-700 font-bold flex items-center gap-1 bg-white shadow-sm">
                <Zap className="w-3 h-3 text-yellow-600" /> Trial Friendly
              </Badge>
            )}
          </div>
        </div>

        {/* Apply Button Area */}
        <div className="shrink-0 w-full lg:w-auto pt-4 lg:pt-0">
          <Button
            size="lg"
            className={`w-full lg:w-60 h-14 md:h-12 rounded-xl md:rounded-2xl font-bold text-base md:text-lg transition-all active:scale-95 shadow-md ${
              job.application_status
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-gray-900 text-white hover:bg-gray-800"
            }`}
            disabled={job.application_status !== null}
            onClick={() => navigate(`/jobs/${job.id}/apply`)}
          >
            {job.application_status !== null ? (
              <span className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" /> Applied
              </span>
            ) : (
              "Submit Proposal"
            )}
          </Button>
          <p className="text-[10px] text-center mt-3 text-gray-500 font-bold uppercase tracking-widest">
            Requires 2 Connects
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        {/* Sidebar - Moved ABOVE content on mobile for context, or kept as sidebar on desktop */}
        <aside className="lg:col-span-4 order-2 lg:order-2 space-y-6 md:space-y-8">
          <Card className="p-5 md:p-6 border border-gray-200 rounded-2xl shadow-sm space-y-6 md:space-y-8 bg-white">
            <div className="space-y-4">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.required_skills?.[0]?.split(",").map((skill) => (
                  <Badge
                    key={skill}
                    className="rounded-lg bg-gray-100 text-gray-700 border border-gray-200 font-bold text-[10px] py-1.5 px-3"
                  >
                    {skill.trim()}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 space-y-4">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">
                Client Verification
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="font-medium">Payment Verified</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Global Recruitment</span>
                </div>
              </div>
            </div>
          </Card>

          <div className="p-5 md:p-6 bg-blue-50/50 rounded-2xl border border-blue-100 hidden lg:block">
            <h4 className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-2">
              <Zap className="w-3 h-3 text-blue-600" /> Pro Tip
            </h4>
            <p className="text-xs text-blue-800 leading-relaxed font-medium">
              Tailor your proposal to the client's specific needs to increase
              your chance of selection.
            </p>
          </div>
        </aside>

        {/* Left Content */}
        <div className="lg:col-span-8 order-1 lg:order-1 space-y-10 md:space-y-12">
          {/* Description */}
          <section className="space-y-4">
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400 flex items-center gap-2">
              <Info className="w-4 h-4" /> Project Overview
            </h2>
            <div className="prose prose-sm md:prose-lg prose-gray max-w-none text-gray-700 leading-relaxed font-normal">
              {job.description}
            </div>
          </section>

          {/* Expected Outcome */}
          {job.expected_outcome && (
            <section className="space-y-4">
              <h2 className="text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">
                Goals & Outcomes
              </h2>
              <div className="p-6 md:p-8 bg-gray-900 rounded-2xl md:rounded-[2rem] shadow-xl">
                <p className="text-gray-100 font-serif italic text-lg md:text-xl leading-relaxed">
                  "{job.expected_outcome}"
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* Updated Skeleton Loader for responsiveness */
function DetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-12 animate-pulse">
      <Skeleton className="h-6 w-32 rounded-full bg-gray-200" />
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-4 w-full md:w-2/3">
          <Skeleton className="h-12 md:h-20 w-full rounded-2xl bg-gray-200" />
          <Skeleton className="h-6 w-1/2 rounded-full bg-gray-200" />
        </div>
        <Skeleton className="h-14 w-full md:w-60 rounded-2xl bg-gray-200" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="col-span-1 lg:col-span-8 space-y-6">
          <Skeleton className="h-64 w-full rounded-3xl bg-gray-200" />
        </div>
        <div className="hidden lg:block lg:col-span-4">
          <Skeleton className="h-80 w-full rounded-3xl bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

function ErrorState({ navigate }) {
  return (
    <div className="max-w-4xl mx-auto py-24 md:py-32 px-6 text-center space-y-6">
      <div className="inline-flex p-4 bg-red-50 rounded-full text-red-600 mb-4">
        <ArrowLeft className="w-10 h-10" />
      </div>
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">
        Project Not Found
      </h2>
      <p className="text-gray-600 max-w-xs mx-auto">
        This listing is no longer available or the link may be broken.
      </p>
      <Button
        onClick={() => navigate("/app/jobs")}
        className="rounded-full px-10 bg-gray-900 text-white hover:bg-gray-800"
      >
        Browse other jobs
      </Button>
    </div>
  );
}
