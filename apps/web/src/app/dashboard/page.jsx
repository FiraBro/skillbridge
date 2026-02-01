import { Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfiles";
import useGithubVisibility from "@/hooks/useGithubVisibility";
import GitHubStats from "@/app/profile/component/github-stats";
import GitHubVerificationBadge from "@/app/profile/component/github-verification-badge";
import GitHubActivityBadge from "@/app/profile/component/github-activity-badge";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  TrendingUp,
  Zap,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  Briefcase,
  Github,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRecommendedJobs } from "@/hooks/useJobs";
import { Skeleton } from "@/components/ui/skeleton";
import ActivityFeed from "./components/activity-feed";

export default function DashboardPage() {
  const { user: viewer } = useAuth();
  const { data: profile } = useProfile(viewer?.username);
  const { canShowGithub, isGithubConnected } = useGithubVisibility(
    profile,
    viewer,
  );
  const { data: recResponse } = useRecommendedJobs();
  const recommendedJob = recResponse?.data?.[0];

  // Map your dynamic data from the logs to the UI stats
  const intelligenceStats = [
    {
      label: "Search Appearances",
      val: profile?.search_views ?? "0",
      trend: "New",
    },
    {
      label: "Public Repos",
      val: profile?.public_repos ?? "0",
      trend: isGithubConnected ? "Synced" : "Pending",
    },
    {
      label: "Average Reputation",
      val: profile?.reputation_score ?? "0",
      trend: profile?.reputation_score > 0 ? "Rising" : "Stable",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome & Global Stats Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight italic uppercase">
            Command Center
          </h1>
          <p className="text-muted-foreground font-medium italic">
            Monitoring{" "}
            <span className="text-primary font-bold">
              {profile?.full_name || viewer?.name}’s
            </span>{" "}
            verified influence.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-card border rounded-2xl shadow-sm">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
              Role
            </p>
            <p className="text-xl font-bold capitalize">
              {viewer?.role || "Developer"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Feed Column */}
        <div className="lg:col-span-8 space-y-8">
          {recommendedJob ? (
            <Card className="relative overflow-hidden group border-2 border-primary/20 shadow-xl shadow-primary/5 rounded-3xl p-8 bg-gradient-to-br from-card to-primary/5">
              <div className="absolute top-0 right-0 p-4">
                <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase">
                  Match Alert
                </Badge>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors cursor-pointer">
                    {recommendedJob.title}
                  </h3>
                  <p className="text-muted-foreground line-clamp-2 text-sm max-w-xl">
                    {recommendedJob.description}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Link to="/jobs">
                    <Button className="font-bold rounded-xl gap-2 shadow-lg shadow-primary/20">
                      Analyze Selection <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <span className="text-xs font-bold text-primary flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 fill-primary" />
                    {recommendedJob.match_score}% Match Strength
                  </span>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 rounded-3xl border-dashed border-2 flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-3 bg-muted rounded-full">
                <Briefcase className="text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">
                Finding the best job matches for your profile...
              </p>
            </Card>
          )}

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Global Activity
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-bold gap-2"
              >
                <MessageSquare className="h-3.5 w-3.5" /> View Community
              </Button>
            </div>
            <Suspense
              fallback={<Skeleton className="h-96 rounded-3xl w-full" />}
            >
              <ActivityFeed />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
