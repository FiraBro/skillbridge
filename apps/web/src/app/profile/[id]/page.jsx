import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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
  const { user: viewer } = useAuth();

  /* -------------------- DATA -------------------- */

  const {
    data: profile,
    isLoading: loadingProfile,
    isError,
  } = useProfile(username);

  const userId = profile?.user_id;

  const { data: reputation } = useReputation(userId);
  const { data: history } = useReputationHistory(userId);

  /* -------------------- ROLE LOGIC -------------------- */
  console.log("profile role:", viewer);

  const viewerRole = viewer?.role; // developer | company | admin

  const isOwnProfile = viewer?.id === userId;
  const isAdmin = viewerRole === "admin";
  const isDeveloperProfile = viewerRole === "developer";

  /* -------------------- LOADING / ERROR -------------------- */

  if (loadingProfile) {
    return <Skeleton className="h-96 rounded-3xl w-full" />;
  }

  if (isError || !profile) {
    return (
      <div className="p-20 text-center font-bold italic text-muted-foreground">
        User not found
      </div>
    );
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <ProfileHero
        user={{
          id: profile.user_id,
          name: profile.full_name,
          username: profile.username,
        }}
        reputation={reputation?.data?.total ?? profile.reputation_score}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MAIN */}
        <div className="lg:col-span-2 space-y-8">
          <Tabs defaultValue="overview">
            <TabsList className="bg-muted/50 p-1 h-12 rounded-xl mb-6">
              <TabsTrigger value="overview">
                <Zap className="h-4 w-4 mr-1" /> Overview
              </TabsTrigger>

              {isDeveloperProfile && (
                <TabsTrigger value="history">
                  <History className="h-4 w-4 mr-1" /> History
                </TabsTrigger>
              )}

              {isDeveloperProfile && !isOwnProfile && (
                <TabsTrigger value="endorsements">
                  <Award className="h-4 w-4 mr-1" /> Validations
                </TabsTrigger>
              )}

              {isAdmin && <TabsTrigger value="admin">🛡 Admin</TabsTrigger>}
            </TabsList>

            {/* OVERVIEW */}
            <TabsContent value="overview" className="space-y-8">
              {isDeveloperProfile && (
                <>
                  <ReputationBreakdown
                    total={reputation?.data?.total}
                    breakdown={reputation?.data?.breakdown}
                  />

                  <SkillsCloud skills={profile.skills || []} />

                  <GitHubStats
                    stats={{
                      stars: profile.total_stars ?? 0,
                      prs: profile.pull_requests ?? 0,
                      commits30d: profile.commits_30d ?? 0,
                      username: profile.github_username,
                    }}
                  />
                </>
              )}
            </TabsContent>

            {/* HISTORY */}
            {isDeveloperProfile && (
              <TabsContent value="history">
                <ReputationHistory events={history?.data || []} />
              </TabsContent>
            )}

            {/* ENDORSEMENTS */}
            {isDeveloperProfile && !isOwnProfile && (
              <TabsContent value="endorsements">
                <EndorsementSection
                  skills={profile.skills || []}
                  userId={userId}
                />
              </TabsContent>
            )}

            {/* ADMIN */}
            {isAdmin && (
              <TabsContent value="admin">
                <div className="bg-card rounded-3xl border p-8 space-y-4">
                  <h3 className="font-bold">Admin Actions</h3>
                  <button className="btn-danger">Suspend User</button>
                  <button className="btn-warning">Reset Reputation</button>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          <ContactPanel
            userId={profile.user_id}
            userName={profile.full_name}
            isOwnProfile={isOwnProfile}
          />

          <div className="bg-card rounded-3xl border p-6 space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Verification Status
            </h3>

            <div className="flex justify-between">
              <span>Identity</span>
              <Badge variant="outline" className="text-green-500">
                Verified
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
