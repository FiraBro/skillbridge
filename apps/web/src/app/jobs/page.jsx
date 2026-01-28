import { useState } from "react";
import { useJobs, useRecommendedJobs, useApplyJob } from "@/hooks/useJobs";
import JobCard from "./components/job-card.jsx";
import ApplyModal from "./components/apply-modal.jsx";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  Rocket,
  ChevronRight,
  Sparkles,
  SearchCode,
  ArrowUpRight,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function JobFeed() {
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const { data: jobsResponse, isLoading: loadingJobs } = useJobs({ q: search });
  const { data: recResponse, isLoading: loadingRecs } = useRecommendedJobs();
  const applyMutation = useApplyJob();

  const { toast } = useToast();

  const jobs = jobsResponse?.data || [];
  const recommendedJobs = recResponse?.data || [];

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setIsApplyModalOpen(true);
  };

  const handleConfirmApply = async (jobId, message) => {
    try {
      await applyMutation.mutateAsync({ id: jobId, data: { message } });
      toast({
        title: "Application Sent!",
        description:
          "Your verified profile is now being reviewed by the client.",
      });
      setIsApplyModalOpen(false);
    } catch (error) {
      toast({
        title: "Application Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Search & Orientation */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 italic">
              <SearchCode className="text-primary h-8 w-8" />
              TALENT MARKETPLACE
            </h1>
            <p className="text-muted-foreground font-medium">
              Discover verified opportunities matching your{" "}
              <span className="text-foreground font-bold underline decoration-primary/30">
                reputation stack
              </span>
              .
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="px-3 py-1 text-xs font-bold uppercase tracking-wider"
            >
              Online: 2.4k
            </Badge>
            <Badge
              variant="outline"
              className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-green-500 border-green-500/30 bg-green-500/5"
            >
              New: 42
            </Badge>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search by keywords, technologies, or outcomes..."
              className="pl-12 h-14 text-lg bg-card border-border/50 shadow-sm focus-visible:ring-1 focus-visible:ring-primary/50 transition-all rounded-2xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="h-14 px-8 gap-2 font-bold rounded-2xl border-border/50 hover:bg-muted/50"
          >
            <Filter className="h-5 w-5" /> Filters
          </Button>
        </div>
      </div>

      {/* Recommended Section - High Engagement Scroll */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
            <Sparkles className="h-4 w-4 fill-primary" />
            Match Intelligence
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="font-bold text-xs gap-1 group"
          >
            View Analysis{" "}
            <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
          {loadingRecs
            ? [1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  className="min-w-[340px] h-[220px] rounded-3xl"
                />
              ))
            : recommendedJobs.map((job) => (
                <div key={job.id} className="min-w-[340px]">
                  <JobCard job={job} onApply={handleApplyClick} compact />
                </div>
              ))}
          {recommendedJobs.length === 0 && !loadingRecs && (
            <div className="flex items-center justify-center border-2 border-dashed rounded-3xl p-10 min-w-[340px]">
              <p className="text-xs font-medium text-muted-foreground text-center">
                Complete more projects for AI recommendations
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Main Feed - High Density Upwork Style */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold tracking-tight">
            Recent Opportunities
          </h2>
          <div className="flex gap-4">
            <span className="text-sm font-medium text-primary cursor-pointer border-b-2 border-primary">
              All
            </span>
            <span className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground">
              Full-time
            </span>
            <span className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground">
              Contract
            </span>
          </div>
        </div>

        <div className="divide-y divide-border/30">
          {loadingJobs
            ? [1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="py-8 space-y-4">
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))
            : jobs.map((job) => (
                <div
                  key={job.id}
                  className="group py-8 first:pt-0 last:pb-0 hover:bg-primary/[0.02] transition-colors -mx-4 px-4 rounded-xl"
                >
                  <div className="flex justify-between items-start gap-6">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold hover:text-primary cursor-pointer transition-colors flex items-center gap-2">
                          {job.title}
                          <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all text-primary" />
                        </h3>
                        {job.trial_friendly && (
                          <Badge className="bg-green-500 text-[10px] font-black uppercase">
                            Trial Ready
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        <span className="font-bold text-foreground/80">
                          ${job.budget_range || "Market Rate"}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground italic">
                          Posted {new Date(job.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="flex items-center gap-1 text-primary font-medium">
                          <Rocket className="h-3 w-3" /> {job.match_score || 0}%
                          Match
                        </span>
                      </div>

                      <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {job.skills_required?.map((skill) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="bg-muted/30 border-none text-[10px] font-bold uppercase tracking-tight"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <Button
                        className="px-6 rounded-xl font-black shadow-lg shadow-primary/10 transition-all hover:scale-[1.02]"
                        onClick={() => handleApplyClick(job)}
                      >
                        PROPOSE
                      </Button>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">
                        2-4 Applicants
                      </span>
                    </div>
                  </div>
                </div>
              ))}

          {!loadingJobs && jobs.length === 0 && (
            <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed">
              <p className="text-muted-foreground font-medium">
                No results found for your query. Try broaden your search.
              </p>
            </div>
          )}
        </div>
      </section>

      <ApplyModal
        job={selectedJob}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onConfirm={handleConfirmApply}
      />
    </div>
  );
}
