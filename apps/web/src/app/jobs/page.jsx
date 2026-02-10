import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate
import { motion, AnimatePresence } from "framer-motion";
import { useJobs } from "@/hooks/useJobs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  MapPin,
  Star,
  ThumbsDown,
  Heart,
  CheckCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function JobFeed() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("matches");
  const navigate = useNavigate(); // Hook for redirection

  const { data: jobsResponse, isLoading: loadingJobs } = useJobs({ q: search });
  const jobs = jobsResponse?.data || [];

  // This replaces the old handleApplyClick modal logic
  const handleApplyRedirect = (jobId) => {
    // Redirects to /jobs/:id/apply (or your preferred route)
    navigate(`/jobs/${jobId}/apply`);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFC] dark:bg-zinc-950 font-sans overflow-x-hidden">
      {/* HEADER SECTION */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-serif font-bold text-zinc-900 dark:text-zinc-50 mb-10 tracking-tight"
          >
            Find Work
          </motion.h1>
          <div className="flex items-center shadow-sm rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for your next project..."
                className="pl-12 h-14 bg-transparent border-none focus-visible:ring-0 rounded-none text-lg"
              />
            </div>
            <Button className="h-14 px-10 rounded-none font-bold bg-zinc-900 hover:bg-zinc-800 text-white transition-all">
              Search
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto bg-white dark:bg-zinc-900 border-x border-zinc-100 dark:border-zinc-800 min-h-screen">
        {/* TABS */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md z-20 px-6">
          <TabButton
            label="Best Matches"
            active={activeTab === "matches"}
            onClick={() => setActiveTab("matches")}
          />
          <TabButton
            label="Most Recent"
            active={activeTab === "recent"}
            onClick={() => setActiveTab("recent")}
          />
          <TabButton
            label="Saved Jobs"
            active={activeTab === "saved"}
            onClick={() => setActiveTab("saved")}
          />
        </div>

        {/* JOB LISTINGS */}
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          <AnimatePresence mode="popLayout">
            {loadingJobs ? (
              <LoadingState />
            ) : jobs.length > 0 ? (
              jobs.map((job, index) => (
                <JobCard
                  key={job.id}
                  job={job}
                  index={index}
                  onApply={() => handleApplyRedirect(job.id)}
                />
              ))
            ) : (
              <EmptyState />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-5 text-sm font-bold transition-all relative mr-8 ${
        active
          ? "text-zinc-900 dark:text-zinc-100"
          : "text-zinc-400 hover:text-zinc-600"
      }`}
    >
      {label}
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-indigo-600 dark:bg-indigo-400"
        />
      )}
    </button>
  );
}

function JobCard({ job, onApply, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="p-8 md:p-10 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-all group"
    >
      <div className="flex justify-between items-start gap-6 mb-3">
        <Link to={`/jobs/${job.id}`} className="flex-1 group/link">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight group-hover/link:text-indigo-600 dark:group-hover/link:text-indigo-400 transition-colors">
            {job.title}
          </h3>
        </Link>

        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-9 w-9 border-zinc-200"
          >
            <ThumbsDown className="h-4 w-4 text-zinc-400" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-9 w-9 border-zinc-200 hover:text-rose-500 hover:bg-rose-50"
          >
            <Heart className="h-4 w-4 text-zinc-400" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-5">
        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
          Fixed-price - Intermediate - Budget: ${job.budget_range}
        </span>
        <span>•</span>
        <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
      </div>

      <p className="text-zinc-600 dark:text-zinc-400 text-[15px] leading-relaxed mb-6 line-clamp-2 max-w-4xl">
        {job.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        {parseSkills(job.required_skills).map((skill, i) => (
          <span
            key={i}
            className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[11px] px-3 py-1 rounded-full font-medium"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-6 text-[13px] text-zinc-500">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
            <CheckCircle className="h-4 w-4 fill-emerald-600 text-white" />
            Payment Verified
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.9
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" /> Remote
          </span>
        </div>

        <Button
          onClick={onApply}
          className="bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white font-bold rounded-full px-8 h-11 hover:bg-indigo-600 dark:hover:bg-white transition-all"
        >
          Apply Now
        </Button>
      </div>
    </motion.div>
  );
}

/* --- Helpers --- */
const parseSkills = (raw) => {
  if (Array.isArray(raw)) return raw.slice(0, 5);
  if (typeof raw === "string") return raw.split(",").slice(0, 5);
  return [];
};

function LoadingState() {
  return (
    <div className="p-10 space-y-12">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-6 w-1/3 rounded" />
          <Skeleton className="h-16 w-full rounded" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-32 text-center">
      <h3 className="text-xl font-bold">No projects found</h3>
      <p className="text-zinc-500">Try adjusting your filters.</p>
    </div>
  );
}
