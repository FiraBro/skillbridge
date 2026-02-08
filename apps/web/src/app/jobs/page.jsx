import { useState } from "react";
import { useJobs, useRecommendedJobs, useApplyJob } from "@/hooks/useJobs";
import ApplyModal from "./components/apply-modal.jsx";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  MapPin,
  DollarSign,
  CheckCircle,
  Star,
  ThumbsDown,
  Heart,
  Clock,
  Briefcase,
  History,
  Bookmark,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function JobFeed() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("matches");
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const { data: jobsResponse, isLoading: loadingJobs } = useJobs({ q: search });
  const applyMutation = useApplyJob();
  const { toast } = useToast();

  const jobs = jobsResponse?.data || [];

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setIsApplyModalOpen(true);
  };

  const handleConfirmApply = async (jobId, message) => {
    try {
      await applyMutation.mutateAsync({ id: jobId, data: { message } });
      toast({
        title: "Proposal Sent",
        description: "Your application is active.",
      });
      setIsApplyModalOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans selection:bg-primary/10">
      {/* HEADER SECTION - NO RADIUS, BORDER BOTTOM ONLY */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-8 tracking-tight">
            Find Work
          </h1>
          <div className="flex items-center gap-0">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for jobs"
                className="pl-12 h-12 bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 rounded-l-md rounded-r-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0"
              />
            </div>
            <Button className="h-12 px-8 rounded-l-none rounded-r-md font-bold bg-[#108a00] hover:bg-[#0d7300] transition-colors">
              <Search className="h-5 w-5 md:mr-2" />
              <span className="hidden md:inline">Search</span>
            </Button>
          </div>
        </div>
      </div>

      {/* CONTENT SECTION - NO ROUNDED CORNERS OR SHADOWS */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-white dark:bg-zinc-900">
          {/* TABS - BORDER BOTTOM ONLY */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-20 px-4">
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

          {/* JOB LISTINGS - SEPARATED BY BORDERS */}
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {loadingJobs ? (
              <div className="p-8 space-y-10">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-none" />
                ))}
              </div>
            ) : jobs.length > 0 ? (
              jobs.map((job) => (
                <JobCard key={job.id} job={job} onApply={handleApplyClick} />
              ))
            ) : (
              <div className="py-24 text-center">
                <p className="text-zinc-500">No projects match your search.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ApplyModal
        job={selectedJob}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onConfirm={handleConfirmApply}
      />
    </div>
  );
}

// --- SUB-COMPONENTS ---

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-4 text-sm font-bold transition-all relative mr-6 ${
        active ? "text-[#108a00]" : "text-zinc-500 hover:text-zinc-800"
      }`}
    >
      {label}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#108a00]" />
      )}
    </button>
  );
}

function JobCard({ job, onApply }) {
  return (
    <div className="p-6 md:p-10 hover:bg-[#f9f9f9] dark:hover:bg-zinc-800/40 transition-colors group">
      <div className="flex justify-between items-start gap-4 mb-2">
        <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-[#108a00] cursor-pointer transition-colors leading-snug">
          {job.title}
        </h3>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full border-zinc-300 text-zinc-600"
          >
            <ThumbsDown className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full border-zinc-300 text-zinc-600 hover:text-red-500"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-zinc-600 mb-4">
        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
          Fixed-price - Intermediate - Est. Budget: ${job.budget_range}
        </span>
        <span className="text-zinc-400">
          - Posted {new Date(job.created_at).toLocaleDateString()}
        </span>
      </div>

      <p className="text-zinc-800 dark:text-zinc-300 text-[15px] leading-normal mb-6 max-w-4xl">
        {job.description}
      </p>

      {/* SKILLS AS FLAT TEXT/BADGES */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(() => {
          const rawSkills = job.required_skills;
          const skillArray = Array.isArray(rawSkills)
            ? rawSkills
            : typeof rawSkills === "string"
              ? rawSkills.split(",")
              : [];
          return skillArray.slice(0, 8).map((skill, i) => (
            <span
              key={i}
              className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 text-xs px-3 py-1 rounded-full font-medium"
            >
              {skill.trim()}
            </span>
          ));
        })()}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-6 text-[13px] text-zinc-500">
          <span className="flex items-center gap-1 font-bold text-[#108a00]">
            <CheckCircle className="h-4 w-4 fill-[#108a00] text-white" />{" "}
            Payment verified
          </span>
          <span className="flex items-center gap-1 font-bold">
            <Star className="h-4 w-4 text-[#108a00] fill-[#108a00]" /> 5.00
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" /> Global
          </span>
        </div>

        <Button
          onClick={() => onApply(job)}
          className="bg-[#108a00] hover:bg-[#0d7300] text-white font-bold rounded-full px-8 transition-all active:scale-95"
        >
          Apply Now
        </Button>
      </div>
    </div>
  );
}
