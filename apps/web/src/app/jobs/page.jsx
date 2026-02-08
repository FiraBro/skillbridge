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
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-zinc-950 font-sans selection:bg-primary/10">
      {/* HEADER SECTION - FULL WIDTH SEARCH */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
            Find Work
          </h1>
          <div className="relative group flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-primary transition-colors" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for projects, technologies, or keywords..."
                className="pl-12 h-14 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-lg rounded-xl focus-visible:ring-primary/20"
              />
            </div>
            <Button className="h-14 px-8 rounded-xl font-bold text-base shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/40 dark:shadow-none overflow-hidden">
          {/* MODERN TABS */}
          <div className="flex border-b border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md sticky top-0 z-20">
            <TabButton
              icon={<Briefcase className="w-4 h-4" />}
              label="Best Matches"
              active={activeTab === "matches"}
              onClick={() => setActiveTab("matches")}
            />
            <TabButton
              icon={<History className="w-4 h-4" />}
              label="Most Recent"
              active={activeTab === "recent"}
              onClick={() => setActiveTab("recent")}
            />
            <TabButton
              icon={<Bookmark className="w-4 h-4" />}
              label="Saved Jobs"
              active={activeTab === "saved"}
              onClick={() => setActiveTab("saved")}
            />
          </div>

          {/* JOB LISTINGS */}
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {loadingJobs ? (
              <div className="p-8 space-y-10">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-56 w-full rounded-2xl" />
                ))}
              </div>
            ) : jobs.length > 0 ? (
              jobs.map((job) => (
                <JobCard key={job.id} job={job} onApply={handleApplyClick} />
              ))
            ) : (
              <div className="p-20 text-center space-y-4">
                <div className="inline-flex p-4 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  No projects found
                </h3>
                <p className="text-zinc-500 max-w-xs mx-auto text-sm">
                  Try adjusting your search filters to find what you're looking
                  for.
                </p>
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

function TabButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-8 py-5 text-sm font-bold transition-all border-b-2 relative ${
        active
          ? "border-primary text-primary bg-primary/5"
          : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800"
      }`}
    >
      {icon}
      {label}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-in fade-in zoom-in duration-300" />
      )}
    </button>
  );
}

function JobCard({ job, onApply }) {
  return (
    <div className="p-10 hover:bg-[#F9FAFB] dark:hover:bg-zinc-800/40 transition-all group relative">
      <div className="flex justify-between items-start gap-6 mb-4">
        <div className="space-y-1.5 flex-1">
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors cursor-pointer leading-tight">
            {job.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-zinc-500">
            <span className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100 font-bold">
              <DollarSign className="h-4 w-4 text-emerald-600" /> $
              {job.budget_range}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> Intermediate
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> Remote
            </span>
            <span className="text-zinc-400 font-normal">
              Posted {new Date(job.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-zinc-200 shadow-sm"
          >
            <ThumbsDown className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full border-zinc-200 shadow-sm hover:text-red-500 hover:bg-red-50"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <p className="text-zinc-600 dark:text-zinc-400 text-[16px] leading-[1.7] mb-6 line-clamp-3 max-w-4xl">
        {job.description}
      </p>

      {/* SKILLS TAGS */}
      <div className="flex flex-wrap gap-2 mb-8">
        {(() => {
          const rawSkills = job.required_skills;
          const skillArray = Array.isArray(rawSkills)
            ? rawSkills
            : typeof rawSkills === "string"
              ? rawSkills.split(",").map((s) => s.trim())
              : [];

          return skillArray.slice(0, 8).map((skill, i) => (
            <Badge
              key={i}
              variant="secondary"
              className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold px-4 py-1.5 border-none rounded-full text-xs tracking-wide"
            >
              {skill}
            </Badge>
          ));
        })()}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-zinc-50 dark:border-zinc-800">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-500 text-xs uppercase tracking-widest">
            <CheckCircle className="h-4 w-4" />
            Payment Verified
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-zinc-500">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            5.00 Rating
          </div>
        </div>
        <Button
          onClick={() => onApply(job)}
          className="h-11 px-8 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-md transition-all active:scale-95"
        >
          Apply to Project
        </Button>
      </div>
    </div>
  );
}
