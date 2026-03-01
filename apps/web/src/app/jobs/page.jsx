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
  const jobs = data || [];

  const handleManualSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput.trim() }));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFilters((prev) => ({ ...prev, tab }));
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* HEADER */}
      <div className="border-b border-gray-300">
        {/* Adjusted padding for mobile: py-8 vs py-12 */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl md:text-4xl font-bold tracking-tight mb-6 md:mb-10 text-center md:text-left"
          >
            Find Work
          </motion.h1>

          {/* SEARCH BAR - Flex column on small mobile, row on larger screens */}
          <div className="flex flex-col sm:flex-row items-stretch rounded-xl overflow-hidden border bg-white transition-all shadow-sm">
            <div className="relative flex-1 border-b sm:border-b-0 sm:border-r border-gray-200">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                {isFetching ? (
                  <Loader2 className="h-5 w-5 animate-spin text-black" />
                ) : (
                  <Search className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                placeholder="Search projects..."
                className="pl-12 h-12 md:h-14 border-none bg-transparent text-base md:text-lg focus-visible:ring-0"
              />
            </div>
            <Button
              onClick={handleManualSearch}
              className="h-12 md:h-14 px-10 rounded-none bg-black text-white font-bold transition-colors hover:bg-gray-800"
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Main content - Remove border-x on mobile to save space */}
      <main className="max-w-5xl mx-auto bg-white md:border-x min-h-[60vh]">
        {/* TABS - Horizontal scrollable on mobile */}
        <div className="flex border-b sticky top-[64px] bg-white/95 backdrop-blur-sm z-10 px-4 sm:px-6 overflow-x-auto no-scrollbar">
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
        <div className="relative">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
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
                className="divide-y divide-gray-100"
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
    SUB COMPONENTS
========================= */

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-1 py-4 md:py-5 mr-6 md:mr-8 font-bold capitalize relative transition-colors whitespace-nowrap text-sm md:text-base ${
        active ? "text-black" : "text-gray-500 hover:text-black"
      }`}
    >
      {label}
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-[3px] bg-black"
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
      className="p-5 md:p-8 hover:bg-gray-50 transition-colors group"
    >
      <Link to={`/jobs/${job.id}`}>
        <h3 className="text-lg md:text-xl font-bold mb-2 group-hover:underline underline-offset-4 decoration-1">
          {job.title}
        </h3>
      </Link>
      <p className="text-sm md:text-base text-gray-600 mb-4 line-clamp-3 md:line-clamp-2 leading-relaxed">
        {job.description}
      </p>

      {/* Skill badges - hidden overflow or wrapped */}
      <div className="flex flex-wrap gap-2 mb-6">
        {skills.slice(0, 5).map((s, i) => (
          <span
            key={i}
            className="text-[10px] md:text-xs px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 font-semibold"
          >
            {s}
          </span>
        ))}
      </div>

      {/* Apply button - full width on mobile */}
      <Button
        onClick={onApply}
        className="w-full sm:w-auto px-8 h-11 md:h-10 font-bold bg-black text-white rounded-lg transition-transform active:scale-95"
      >
        Apply Now
      </Button>
    </motion.div>
  );
}

function LoadingState() {
  return (
    <div className="p-5 md:p-8 space-y-10">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-7 w-3/4 md:w-1/3 bg-gray-200 rounded-lg" />
          <Skeleton className="h-4 w-full bg-gray-100 rounded-md" />
          <Skeleton className="h-4 w-5/6 bg-gray-100 rounded-md" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full bg-gray-100" />
            <Skeleton className="h-6 w-20 rounded-full bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ searchTerm, onReset }) {
  return (
    <div className="py-20 md:py-32 px-6 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-gray-100 mb-4">
        <Search className="h-6 w-6 md:h-8 md:h-8 text-gray-400" />
      </div>
      <h3 className="text-lg md:text-xl font-bold text-black">
        No results found
      </h3>
      <p className="text-sm md:text-base text-gray-600 mt-2 max-w-xs mx-auto italic">
        {searchTerm
          ? `We couldn't find any matches for "${searchTerm}"`
          : "Try searching for a different keyword or skill."}
      </p>
      {searchTerm && (
        <Button
          variant="outline"
          onClick={onReset}
          className="mt-6 rounded-full px-8 border-black font-bold hover:bg-black hover:text-white transition-all"
        >
          Clear search
        </Button>
      )}
    </div>
  );
}
