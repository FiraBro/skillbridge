import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useJobs } from "@/hooks/useJobs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Star,
  ThumbsDown,
  Heart,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function JobFeed() {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [activeTab, setActiveTab] = useState("matches");

  // ✅ Single source of truth for API
  const [filters, setFilters] = useState({
    search: "",
    tab: "matches",
  });

  /* =========================
     AUTO SEARCH (DEBOUNCE)
  ========================= */
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchInput.trim(),
      }));
    }, 600);

    return () => clearTimeout(handler);
  }, [searchInput]);

  /* =========================
     DATA FETCH
  ========================= */
  const { data, isLoading, isFetching } = useJobs(filters);
  const jobs = data?.data || [];

  /* =========================
     MANUAL SEARCH
  ========================= */
  const handleManualSearch = () => {
    setFilters((prev) => ({
      ...prev,
      search: searchInput.trim(),
    }));
  };

  /* =========================
     TAB CHANGE
  ========================= */
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFilters((prev) => ({
      ...prev,
      tab,
    }));
  };

  return (
    <div className="min-h-screen bg-[#FBFBFC] dark:bg-zinc-950">
      {/* HEADER */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-serif font-bold mb-10"
          >
            Find Work
          </motion.h1>

          {/* SEARCH BAR */}
          <div className="flex items-center rounded-xl overflow-hidden border bg-white dark:bg-zinc-800 focus-within:ring-2 focus-within:ring-indigo-500">
            <div className="relative flex-1">
              {isFetching ? (
                <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-indigo-500" />
              ) : (
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
              )}
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleManualSearch();
                  }
                }}
                placeholder="Search for your next project..."
                className="pl-12 h-14 border-none bg-transparent text-lg focus-visible:ring-0"
              />
            </div>
            <Button
              onClick={handleManualSearch}
              className="h-14 px-10 rounded-none bg-zinc-900 text-white font-bold"
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <main className="max-w-5xl mx-auto bg-white dark:bg-zinc-900 border-x">
        {/* TABS */}
        <div className="flex border-b sticky top-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur z-10 px-6">
          {["matches", "recent", "saved"].map((tab) => (
            <TabButton
              key={tab}
              label={tab}
              active={activeTab === tab}
              onClick={() => handleTabChange(tab)}
            />
          ))}
        </div>

        {/* JOB LIST */}
        <div className="divide-y">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <LoadingState />
            ) : jobs.length ? (
              jobs.map((job, index) => (
                <JobCard
                  key={job.id}
                  job={job}
                  index={index}
                  onApply={() => navigate(`/jobs/${job.id}/apply`)}
                />
              ))
            ) : (
              <EmptyState
                searchTerm={filters.search}
                onReset={() => {
                  setSearchInput("");
                  setFilters({ search: "", tab: "matches" });
                  setActiveTab("matches");
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

/* =========================
   SUB COMPONENTS
========================= */

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-5 mr-8 font-bold capitalize relative ${
        active ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
      }`}
    >
      {label}
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-indigo-600"
        />
      )}
    </button>
  );
}

function JobCard({ job, onApply, index }) {
  const skills = Array.isArray(job.required_skills)
    ? job.required_skills
    : job.required_skills?.split(",").map((s) => s.trim()) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="p-8 hover:bg-zinc-50 dark:hover:bg-zinc-800/10"
    >
      <Link to={`/jobs/${job.id}`}>
        <h3 className="text-xl font-bold mb-2">{job.title}</h3>
      </Link>

      <p className="text-zinc-600 mb-4 line-clamp-2">{job.description}</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {skills.slice(0, 5).map((s, i) => (
          <span key={i} className="text-xs px-3 py-1 rounded-full bg-zinc-100">
            {s}
          </span>
        ))}
      </div>

      <Button onClick={onApply} className="rounded-full px-8 h-11">
        Apply Now
      </Button>
    </motion.div>
  );
}

function LoadingState() {
  return (
    <div className="p-10 space-y-10">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-28 w-full rounded" />
      ))}
    </div>
  );
}

function EmptyState({ searchTerm, onReset }) {
  return (
    <div className="py-32 text-center">
      <Search className="mx-auto h-10 w-10 text-zinc-400 mb-4" />
      <h3 className="text-2xl font-bold">No jobs found</h3>
      <p className="text-zinc-500 mt-2">
        {searchTerm
          ? `No results for "${searchTerm}"`
          : "Try adjusting your filters"}
      </p>
      {searchTerm && (
        <Button variant="link" onClick={onReset} className="mt-4">
          Clear search
        </Button>
      )}
    </div>
  );
}
