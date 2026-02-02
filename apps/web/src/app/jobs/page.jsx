import { useState } from "react";
import { useJobs, useRecommendedJobs, useApplyJob } from "@/hooks/useJobs";
import JobCard from "./components/job-card.jsx";
import ApplyModal from "./components/apply-modal.jsx";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Rocket,
  Sparkles,
  MapPin,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function JobFeed() {
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const { data: jobsResponse, isLoading: loadingJobs } = useJobs({ q: search });
  const { data: recResponse } = useRecommendedJobs();
  const applyMutation = useApplyJob();
  const { toast } = useToast();

  const jobs = jobsResponse?.data || [];
  console.log("jobs", jobs);
  const recommendedJobs = recResponse?.data || [];

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setIsApplyModalOpen(true);
  };

  const handleConfirmApply = async (jobId, message) => {
    try {
      await applyMutation.mutateAsync({ id: jobId, data: { message } });
      toast({
        title: "Proposal Sent",
        description: "Your application is now active.",
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
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10 animate-in fade-in duration-500">
      {/* 1. SEARCH HEADER */}
      <header className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">
              Talent <span className="text-primary text-4xl">Marketplace</span>
            </h1>
            <p className="text-muted-foreground font-medium">
              Verified contracts for top-tier reputation stacks.
            </p>
          </div>
          <div className="flex gap-2">
            <Badge
              variant="secondary"
              className="bg-primary/5 text-primary border-primary/10"
            >
              {jobs.length} Opportunities
            </Badge>
          </div>
        </div>

        <div className="group relative bg-muted/40 p-1.5 rounded-2xl border border-border/50 transition-all focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/5">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary" />
          <Input
            placeholder="Search tech stack, project title, or client..."
            className="pl-12 h-12 bg-transparent border-none text-base focus-visible:ring-0 shadow-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {/* 2. MAIN FEED GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* SIDEBAR: STATS & RECS */}
        <aside className="hidden lg:block space-y-6 sticky top-24 h-fit">
          <div className="p-5 rounded-3xl bg-card border border-border/60 shadow-sm space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <Sparkles className="h-3 w-3 fill-primary" /> Match Intelligence
            </h3>
            {recommendedJobs.length > 0 ? (
              recommendedJobs.slice(0, 3).map((j) => (
                <div
                  key={j.id}
                  className="group border-b border-border/40 pb-3 last:border-0 cursor-pointer"
                >
                  <h4 className="text-sm font-bold group-hover:text-primary transition-colors line-clamp-1">
                    {j.title}
                  </h4>
                  <p className="text-[10px] font-bold text-muted-foreground mt-1 tracking-tight">
                    ${j.budget_range}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-muted-foreground italic">
                Complete tasks to unlock AI matching.
              </p>
            )}
          </div>
        </aside>

        {/* FEED: LISTINGS */}
        <div className="lg:col-span-3 space-y-0 divide-y divide-border/40">
          {loadingJobs
            ? [1, 2, 3].map((i) => (
                <div key={i} className="py-10 space-y-4">
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ))
            : jobs.map((job) => (
                <article
                  key={job.id}
                  className="group py-10 transition-all hover:bg-muted/5 -mx-4 px-4 rounded-3xl"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                    {/* LEFT: CONTENT */}
                    <div className="flex-1 space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          <h3 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors cursor-pointer leading-none">
                            {job.title}
                          </h3>
                          {job.trial_friendly && (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[9px] uppercase px-2 h-5">
                              Trial Ready
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] font-bold text-muted-foreground/80">
                          <span className="flex items-center gap-1.5 text-foreground font-black">
                            <DollarSign className="h-4 w-4 text-primary" /> $
                            {job.budget_range}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" /> Remote
                          </span>
                          <span className="flex items-center gap-1.5 font-medium">
                            <Clock className="h-4 w-4 opacity-50" />{" "}
                            {new Date(job.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <p className="text-[15px] text-muted-foreground leading-relaxed line-clamp-2 max-w-3xl font-medium">
                        {job.description}
                      </p>

                      {/* DYNAMIC SKILL BADGES (Handles the Array-String format) */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {job.required_skills?.[0]
                          ?.split(",")
                          .map((skill, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="bg-muted text-[10px] font-bold uppercase py-0.5 px-2.5 rounded-md border-none"
                            >
                              {skill.trim()}
                            </Badge>
                          ))}
                      </div>
                    </div>

                    {/* RIGHT: LIVE ACTION PANEL */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto shrink-0 gap-6">
                      <div className="text-right space-y-2.5">
                        <div className="flex items-center gap-2 text-primary justify-end font-black italic text-sm">
                          <Rocket className="h-4 w-4" /> {job.match_score || 85}
                          % Match
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black text-foreground uppercase tracking-tighter">
                              {job.applicant_count || 0} Proposals
                            </span>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((bar) => (
                                <div
                                  key={bar}
                                  className={cn(
                                    "h-1.5 w-3 rounded-full transition-colors",
                                    bar <= (job.applicant_count || 1)
                                      ? "bg-primary"
                                      : "bg-muted",
                                  )}
                                />
                              ))}
                            </div>
                          </div>

                          <Badge
                            className={cn(
                              "text-[9px] font-black uppercase px-2 py-0 border-none h-5 tracking-tight",
                              (job.applicant_count || 0) > 10
                                ? "bg-amber-500/10 text-amber-600"
                                : "bg-emerald-500/10 text-emerald-600",
                            )}
                          >
                            {(job.applicant_count || 0) > 10 ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            )}
                            {(job.applicant_count || 0) > 10
                              ? "High Demand"
                              : "Open for Proposals"}
                          </Badge>
                        </div>
                      </div>

                      <Button
                        className="w-full md:w-44 h-12 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-primary/10 transition-all hover:scale-[1.02] active:scale-95"
                        onClick={() => handleApplyClick(job)}
                      >
                        Propose Project
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
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
