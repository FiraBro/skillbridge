import { useParams } from "react-router-dom";
import {
  useProfile,
  useReputation,
  useReputationHistory,
} from "@/hooks/useProfiles";

import ProfileHero from "../component/profile-hero";
import SkillsCloud from "../component/skill-cloud";
import GitHubStats from "../component/github-stats";
import ReputationBreakdown from "../component/reputation-breakdown";
import ReputationHistory from "../component/reputation-history";
import ContactPanel from "../component/contact-panel";
import EndorsementSection from "../component/endorsement-section";

import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Award, Zap, History } from "lucide-react";

export default function ProfilePage() {
  const { username } = useParams();

  /* -------------------- HOOKS (ALWAYS RUN) -------------------- */

  const {
    data: profile,
    isLoading: loadingProfile,
    isError: profileError,
  } = useProfile(username);

  console.log("profile", profile);

  // Normalize user shape (safe even when profile is undefined)
  const user = profile
    ? {
        id: profile.user_id,
        name: profile.full_name,
        username: profile.username,
      }
    : null;

  const userId = user?.id;

  const { data: reputationResponse, isLoading: loadingReputation } =
    useReputation(userId);

  const { data: historyResponse, isLoading: loadingHistory } =
    useReputationHistory(userId);

  const repBreakdown = reputationResponse?.data;
  const history = historyResponse?.data;

  /* -------------------- LOADING STATE -------------------- */

  if (loadingProfile || loadingReputation || loadingHistory) {
    return (
      <div className="space-y-8 animate-pulse">
        <Skeleton className="h-64 rounded-3xl w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-40 rounded-3xl w-full" />
            <Skeleton className="h-96 rounded-3xl w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 rounded-3xl w-full" />
            <Skeleton className="h-64 rounded-3xl w-full" />
          </div>
        </div>
      </div>
    );
  }

  /* -------------------- NOT FOUND / ERROR -------------------- */

  if (profileError || !profile) {
    return (
      <div className="p-20 text-center font-bold italic text-muted-foreground">
        User not found
      </div>
    );
  }

  /* -------------------- MAIN UI -------------------- */

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero */}
      <ProfileHero
        user={user}
        reputation={repBreakdown?.total ?? profile.reputation_score}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          <Tabs defaultValue="overview">
            <TabsList className="bg-muted/50 p-1 h-12 rounded-xl mb-6">
              <TabsTrigger value="overview" className="flex gap-2 font-bold">
                <Zap className="h-4 w-4" /> Overview
              </TabsTrigger>
              <TabsTrigger value="history" className="flex gap-2 font-bold">
                <History className="h-4 w-4" /> History
              </TabsTrigger>
              <TabsTrigger
                value="endorsements"
                className="flex gap-2 font-bold"
              >
                <Award className="h-4 w-4" /> Validations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <div className="bg-card rounded-3xl border p-8 space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Reputation Core
                </h3>

                <ReputationBreakdown
                  total={repBreakdown?.total}
                  breakdown={repBreakdown?.breakdown}
                />
              </div>

              <SkillsCloud skills={profile.skills || []} />
              <GitHubStats
                stats={{
                  stars: profile.total_stars ?? 0,
                  prs: profile.pull_requests ?? 0,
                  commits30d: profile.commits_30d ?? 0,
                  username: profile.github_username,
                }}
              />
            </TabsContent>

            <TabsContent value="history">
              <div className="bg-card rounded-3xl border p-8">
                <ReputationHistory events={history || []} />
              </div>
            </TabsContent>

            <TabsContent value="endorsements">
              <EndorsementSection
                skills={profile.skills || []}
                userId={userId}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ContactPanel
            userId={user.id}
            userName={user.name}
            isOwnProfile={false}
          />

          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl border border-primary/20 p-8 space-y-4">
            <h3 className="font-bold flex items-center gap-2 text-primary">
              <ShieldCheck className="h-5 w-5" />
              Verification Status
            </h3>

            <div className="space-y-3 text-xs font-bold uppercase text-muted-foreground">
              <div className="flex justify-between">
                <span>Identity</span>
                <Badge variant="outline" className="text-green-500">
                  Verified
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>GitHub</span>
                <Badge variant="outline" className="text-green-500">
                  Connected
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Projects</span>
                <Badge variant="outline" className="text-primary">
                  Active
                </Badge>
              </div>
            </div>
          </div>

          <p className="text-center text-[10px] font-black tracking-widest text-muted-foreground">
            SkillBridge Trust-Link v1.0
          </p>
        </div>
      </div>
    </div>
  );
}
