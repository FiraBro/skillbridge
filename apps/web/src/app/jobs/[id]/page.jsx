import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useJobDetail, useApplyJob } from "@/hooks/useJobs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import ApplyModal from "../components/apply-modal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FaBriefcase,
  FaDollarSign,
  FaArrowLeft,
  FaCheckCircle,
} from "react-icons/fa";
import { Rocket } from "lucide-react";

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const { data: job, isLoading, isError } = useJobDetail(id);
  const applyMutation = useApplyJob();

  const handleApplyClick = () => {
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

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-xl font-bold text-destructive">
          Job not found or error loading details.
        </h2>
        <Button onClick={() => navigate("/jobs")} className="mt-4">
          Back to Jobs
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <Button
        variant="ghost"
        className="gap-2 pl-0 hover:pl-2 transition-all"
        onClick={() => navigate("/jobs")}
      >
        <FaArrowLeft /> Back to Jobs
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-4 flex-1">
          <h1 className="text-4xl font-black tracking-tight">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-2">
              <FaBriefcase className="text-primary" />
              {job.client_name}
            </span>
            <span>•</span>
            <span className="flex items-center gap-2">
              <FaDollarSign className="text-green-500" />
              {job.budget_range || "Market Rate"}
            </span>
            <span>•</span>
            <span className="italic">
              Posted {new Date(job.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <Button
            size="lg"
            className="px-8 font-bold text-lg shadow-lg shadow-primary/20"
            onClick={handleApplyClick}
            disabled={job.application_status}
          >
            {job.application_status ? (
              <span className="flex items-center gap-2">
                <FaCheckCircle /> Applied
              </span>
            ) : (
              "Apply Now"
            )}
          </Button>
          {job.match_score > 0 && (
            <Badge variant="outline" className="text-primary border-primary">
              <Rocket className="w-3 h-3 mr-1" />
              {job.match_score}% Match
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section className="space-y-4">
            <h2 className="text-xl font-bold border-b pb-2">Description</h2>
            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {job.description}
            </div>
          </section>

          {job.expected_outcome && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold border-b pb-2">
                Expected Outcome
              </h2>
              <div className="p-6 bg-secondary/10 rounded-xl border border-border/50">
                <p className="text-foreground font-medium">
                  {job.expected_outcome}
                </p>
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div className="space-y-3">
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                Required Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.required_skills?.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                Job Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trial Friendly</span>
                  <span className="font-medium">
                    {job.trial_friendly ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Applicants</span>
                  <span className="font-medium">2-4</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <ApplyModal
        job={job}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onConfirm={handleConfirmApply}
      />
    </div>
  );
}
