import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useJobs } from "@/hooks/useJobs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function JobFeed() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [activeTab, setActiveTab] = useState("matches");
  const [filters, setFilters] = useState({ search: "", tab: "matches" });

  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput.trim() }));
    }, 600);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const { data, isLoading, isFetching } = useJobs(filters);
  const jobs = data?.data || [];

  const handleManualSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput.trim() }));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFilters((prev) => ({ ...prev, tab }));
  };

  return (
    <div className="min-h-screen bg-[#FBFBFC] dark:bg-zinc-950">
      {/* HEADER - Minimalist Style */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-bold tracking-tight mb-10"
          >
            Find Work
          </motion.h1>

          <div className="flex items-center rounded-xl overflow-hidden border bg-white dark:bg-zinc-800 focus-within:ring-2 focus-within:ring-indigo-500 transition-all shadow-sm">
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                {isFetching ? (
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                ) : (
                  <Search className="h-5 w-5 text-zinc-400" />
                )}
              </div>
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                placeholder="Search for your next project..."
                className="pl-12 h-14 border-none bg-transparent text-lg focus-visible:ring-0"
              />
            </div>
            <Button
              onClick={handleManualSearch}
              className="h-14 px-10 rounded-none bg-zinc-900 hover:bg-zinc-800 text-white font-bold transition-colors"
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto bg-white dark:bg-zinc-900 border-x min-h-[60vh]">
        {/* TABS */}
        <div className="flex border-b sticky top-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md z-10 px-6">
          {["matches", "recent", "saved"].map((tab) => (
            <TabButton
              key={tab}
              label={tab}
              active={activeTab === tab}
              onClick={() => handleTabChange(tab)}
            />
          ))}
        </div>

        {/* JOB LIST WITH SMOOTH TRANSITIONS */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <LoadingState />
              </motion.div>
            ) : jobs.length ? (
              <motion.div
                key="results"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.06 },
                  },
                  exit: { opacity: 0, transition: { duration: 0.2 } },
                }}
                className="divide-y"
              >
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onApply={() => navigate(`/jobs/${job.id}/apply`)}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <EmptyState
                  searchTerm={filters.search}
                  onReset={() => {
                    setSearchInput("");
                    setFilters({ search: "", tab: "matches" });
                    setActiveTab("matches");
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

/* =========================
    REFINED SUB COMPONENTS
========================= */

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-5 mr-8 font-bold capitalize relative transition-colors ${
        active ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
      }`}
    >
      {label}
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-600"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </button>
  );
}

function JobCard({ job, onApply }) {
  const skills = Array.isArray(job.required_skills)
    ? job.required_skills
    : job.required_skills?.split(",").map((s) => s.trim()) || [];

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, x: -10 },
      }}
      className="p-8 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors group"
    >
      <Link to={`/jobs/${job.id}`}>
        <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-600 transition-colors">
          {job.title}
        </h3>
      </Link>
      <p className="text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2 leading-relaxed">
        {job.description}
      </p>
      <div className="flex flex-wrap gap-2 mb-6">
        {skills.slice(0, 5).map((s, i) => (
          <span
            key={i}
            className="text-xs px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 font-medium"
          >
            {s}
          </span>
        ))}
      </div>
      <Button
        onClick={onApply}
        className="rounded-full px-8 h-10 font-semibold shadow-sm"
      >
        Apply Now
      </Button>
    </motion.div>
  );
}

function LoadingState() {
  return (
    <div className="p-8 space-y-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ searchTerm, onReset }) {
  return (
    <div className="py-32 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 mb-4">
        <Search className="h-8 w-8 text-zinc-400" />
      </div>
      <h3 className="text-xl font-bold">No results found</h3>
      <p className="text-zinc-500 mt-2 max-w-xs mx-auto">
        {searchTerm
          ? `We couldn't find any jobs matching "${searchTerm}"`
          : "Try adjusting your filters"}
      </p>
      {searchTerm && (
        <Button
          variant="outline"
          onClick={onReset}
          className="mt-6 rounded-full px-8"
        >
          Clear search
        </Button>
      )}
    </div>
  );
}
