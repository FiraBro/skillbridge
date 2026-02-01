import { useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";
import {
  useProfile,
  useReputation,
  useReputationHistory,
} from "@/hooks/useProfiles";
import { initiateGithubAuth } from "@/lib/api";

import ProfileHero from "../component/profile-hero";
import SkillsCloud from "../component/skill-cloud";
import GitHubStats from "../component/github-stats";
import ReputationBreakdown from "../component/reputation-breakdown";
import ReputationHistory from "../component/reputation-history";
import ContactPanel from "../component/contact-panel";
import EndorsementSection from "../component/endorsement-section";
import GitHubVerificationBadge from "../component/github-verification-badge";
import GitHubActivityBadge from "../component/github-activity-badge";

import useGithubVisibility from "@/hooks/useGithubVisibility";

import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Award, Zap, History } from "lucide-react";

export default function ProfilePage() {
  const { username } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user: viewer } = useAuth();
  const handledParams = useRef(false);

  /* -------------------- DATA -------------------- */

  const {
    data: profile,
    isLoading: loadingProfile,
    isError,
  } = useProfile(username);
  console.log("mamamamma", profile);
  const userId = profile?.user_id;

  const { data: reputation } = useReputation(userId);
  const { data: history } = useReputationHistory(userId);
  console.log("ProfilePage - profile:", profile);
  console.log("ProfilePage - viewer:", viewer);

  /* -------------------- GITHUB VISIBILITY -------------------- */

  const { canShowGithub, canConnectGithub, isGithubConnected } =
    useGithubVisibility(profile, viewer);

  /* -------------------- GITHUB OAUTH CALLBACK -------------------- */

  useEffect(() => {
    if (handledParams.current || !username) return;

    const success = searchParams.get("success");
    const error = searchParams.get("error");
    const details = searchParams.get("details");

    if (success === "github_connected") {
      handledParams.current = true;
      toast.success("GitHub account connected successfully.");

      queryClient.invalidateQueries({ queryKey: ["profile", username] });
      queryClient.invalidateQueries({ queryKey: ["reputation"] });

      setSearchParams({}, { replace: true });
      return;
    }

    if (error) {
      handledParams.current = true;
      toast.error(
        details ? decodeURIComponent(details) : "GitHub connection failed.",
      );
      setSearchParams({}, { replace: true });
    }
  }, [username, searchParams, setSearchParams, queryClient]);

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

              {canShowGithub && (
                <TabsTrigger value="history">
                  <History className="h-4 w-4 mr-1" /> History
                </TabsTrigger>
              )}

              {canShowGithub && viewer?.id !== userId && (
                <TabsTrigger value="endorsements">
                  <Award className="h-4 w-4 mr-1" /> Validations
                </TabsTrigger>
              )}
            </TabsList>

            {/* OVERVIEW */}
            <TabsContent value="overview" className="space-y-8">
              {canShowGithub && (
                <>
                  <ReputationBreakdown
                    total={reputation?.data?.total || profile.reputation_score}
                    breakdown={reputation?.data?.breakdown}
                  />

                  <SkillsCloud skills={profile.skills || []} />

                  {/* CONNECT GITHUB */}
                  {canConnectGithub && (
                    <button
                      onClick={initiateGithubAuth}
                      className="btn btn-github"
                    >
                      🐙 Connect GitHub
                    </button>
                  )}

                  {/* GITHUB DATA - Show if stats exist even if not connected yet */}
                  {(isGithubConnected ||
                    profile.total_stars > 0 ||
                    profile.followers > 0 ||
                    profile.commits_30d > 0) && (
                    <>
                      <GitHubStats
                        stats={{
                          username: profile.github_username,
                          stars: profile.total_stars ?? 0,
                          prs: profile.pull_requests ?? 0,
                          commits30d: profile.commits_30d ?? 0,
                        }}
                      />

                      <div className="flex gap-2 mt-2">
                        <GitHubVerificationBadge
                          stats={{
                            account_created: profile.account_created,
                            public_repos: profile.public_repos,
                            commits_30d: profile.commits_30d,
                          }}
                        />
                        <GitHubActivityBadge
                          stats={{
                            commits_30d: profile.commits_30d,
                            total_commits: profile.total_commits,
                          }}
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </TabsContent>

            {/* HISTORY */}
            {canShowGithub && (
              <TabsContent value="history">
                <ReputationHistory events={history?.data || []} />
              </TabsContent>
            )}

            {/* ENDORSEMENTS */}
            {canShowGithub && viewer?.id !== userId && (
              <TabsContent value="endorsements">
                <EndorsementSection
                  skills={profile.skills || []}
                  userId={userId}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          <ContactPanel
            userId={profile.user_id}
            userName={profile.full_name}
            isOwnProfile={viewer?.id === userId}
          />

          <div className="bg-card rounded-3xl border p-6 space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-4 text-primary" />
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
