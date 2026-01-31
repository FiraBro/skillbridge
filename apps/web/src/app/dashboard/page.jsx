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
  UserCircle,
  Briefcase,
  LineChart,
  TrendingUp,
  Zap,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRecommendedJobs } from "@/hooks/useJobs";
import { Skeleton } from "@/components/ui/skeleton";
import ActivityFeed from "./components/activity-feed";

export default function DashboardPage() {
  const { user: viewer } = useAuth();
  // Assume dashboard is for the logged-in user
  const { data: profile } = useProfile(viewer?.username);
  const { canShowGithub, isGithubConnected } = useGithubVisibility(
    profile,
    viewer,
  );
  const { data: recResponse, isLoading: loadingRecs } = useRecommendedJobs();
  const recommendedJob = recResponse?.data?.[0];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome & Global Stats Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight italic">
            COMMAND CENTER
          </h1>
          <p className="text-muted-foreground font-medium italic">
            Monitoring your{" "}
            <span className="text-primary font-bold">verified influence</span>{" "}
            and career momentum.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-card border rounded-2xl shadow-sm">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
              Active Trials
            </p>
            <p className="text-xl font-bold">02</p>
          </div>
          <div className="px-4 py-2 bg-primary/5 border border-primary/20 rounded-2xl shadow-sm">
            <p className="text-[10px] font-black uppercase text-primary tracking-widest">
              Trust Index
            </p>
            <p className="text-xl font-bold text-primary">842</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Feed Column (Left/Center) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Featured Recommendation (Dev.to Style Top Card) */}
          {recommendedJob && (
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
                    <Zap className="h-3 w-3 fill-primary" />{" "}
                    {recommendedJob.match_score}% Match Strength
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Activity/Notifications Feed */}
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

        {/* Intelligence Sidebar (Right) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-8 space-y-6 rounded-3xl border-border/50 shadow-sm">
            <div className="flex items-center gap-4 border-b pb-6">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <LineChart className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold">Growth Intelligence</h3>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                  30 Day Audit
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Example: Show GitHub stats if connected and allowed */}
              {canShowGithub && isGithubConnected && (
                <>
                  <GitHubStats
                    stats={{
                      stars: profile?.total_stars ?? 0,
                      prs: profile?.pull_requests ?? 0,
                      commits30d: profile?.commits_30d ?? 0,
                      username: profile?.github_username,
                      ...profile?.github,
                    }}
                  />
                  <div className="flex gap-2 mt-2">
                    <GitHubVerificationBadge stats={profile?.github} />
                    <GitHubActivityBadge stats={profile?.github} />
                  </div>
                </>
              )}
              {/* Other dashboard stats */}
              {[
                { label: "Search Appearances", val: "124", trend: "+12%" },
                { label: "Profile Conversions", val: "18", trend: "+5%" },
                { label: "Average Reputation", val: "842", trend: "Stable" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex justify-between items-end"
                >
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-black">{stat.val}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5 bg-primary/5 text-primary border-primary/20"
                  >
                    {stat.trend}
                  </Badge>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full gap-2 font-bold h-12 rounded-xl group overflow-hidden relative"
            >
              <span className="relative z-10 flex items-center gap-2">
                Download PDF Audit{" "}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-primary/5 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </Button>
          </Card>

          <div className="p-8 rounded-3xl bg-primary text-primary-foreground space-y-4 shadow-xl shadow-primary/20 relative overflow-hidden group">
            <ShieldCheck className="absolute -bottom-6 -right-6 h-32 w-32 opacity-10 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10 space-y-4">
              <h3 className="text-lg font-black tracking-tight leading-none italic uppercase">
                Optimize Your Presence
              </h3>
              <p className="text-xs text-primary-foreground/80 leading-relaxed font-medium">
                Developing a project with <b>SkillBridge AI</b> increases your
                match visibility by 240% for tier-1 recruiters.
              </p>
              <Button
                variant="secondary"
                className="w-full font-black text-xs uppercase h-10 rounded-lg"
              >
                Start Training AI
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
