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
  const { data: profileResponse, isLoading: loadingProfile } =
    useProfile(username);
  const profile = profileResponse?.data;
  const userId = profile?.user_id || profile?.user?.id;

  const { data: repBreakdown, isLoading: loadingRep } = useReputation(userId);
  const { data: history, isLoading: loadingHistory } =
    useReputationHistory(userId);

  if (loadingProfile || loadingRep) {
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

  if (!profile)
    return (
      <div className="p-20 text-center font-bold italic">User not found</div>
    );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Hero Section */}
      <ProfileHero
        user={profile.user}
        reputation={repBreakdown?.total || profile.reputation_score}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Content Pane */}
        <div className="lg:col-span-2 space-y-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-muted/50 p-1 h-12 rounded-xl mb-6">
              <TabsTrigger
                value="overview"
                className="rounded-lg px-6 font-bold flex gap-2"
              >
                <Zap className="h-4 w-4" /> Overview
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="rounded-lg px-6 font-bold flex gap-2"
              >
                <History className="h-4 w-4" /> History
              </TabsTrigger>
              <TabsTrigger
                value="endorsements"
                className="rounded-lg px-6 font-bold flex gap-2"
              >
                <Award className="h-4 w-4" /> Validations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <div className="bg-card rounded-3xl border p-8 space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <ShieldCheck className="text-primary h-5 w-5" />
                  Reputation Core
                </h3>
                <ReputationBreakdown
                  total={repBreakdown?.total}
                  breakdown={repBreakdown?.breakdown}
                />
              </div>

              <SkillsCloud skills={profile.skills} />
              <GitHubStats stats={profile.github_stats} />
            </TabsContent>

            <TabsContent value="history">
              <div className="bg-card rounded-3xl border p-8">
                <ReputationHistory events={history?.data} />
              </div>
            </TabsContent>

            <TabsContent value="endorsements">
              <EndorsementSection skills={profile.skills} userId={userId} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Action & Trust Pane */}
        <div className="space-y-6">
          <ContactPanel
            userId={profile.user.id}
            userName={profile.user.name}
            isOwnProfile={false} // Should come from auth context
          />

          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl border border-primary/20 p-8 space-y-4">
            <h3 className="font-bold flex items-center gap-2 text-primary">
              <ShieldCheck className="h-5 w-5" />
              Verification Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-muted-foreground">
                <span>Identity</span>
                <Badge
                  variant="outline"
                  className="text-[10px] text-green-500 border-green-500/30"
                >
                  Verified
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs font-bold uppercase text-muted-foreground">
                <span>GitHub</span>
                <Badge
                  variant="outline"
                  className="text-[10px] text-green-500 border-green-500/30"
                >
                  Connected
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs font-bold uppercase text-muted-foreground">
                <span>Projects</span>
                <Badge
                  variant="outline"
                  className="text-[10px] text-primary border-primary/30"
                >
                  3 Active
                </Badge>
              </div>
            </div>
            <div className="pt-4 border-t border-primary/10">
              <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                This reputation score represents the mathematical aggregate of
                GitHub activity, peer endorsements, and community contributions.
              </p>
            </div>
          </div>

          <div className="p-4 text-center">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
              SkillBridge Trust-Link v1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
