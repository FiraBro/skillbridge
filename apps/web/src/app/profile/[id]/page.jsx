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
import { usePosts, useDeletePost } from "@/hooks/usePosts";
import { initiateGithubAuth } from "@/lib/api";

// Components
import ProfileHero from "../component/profile-hero";
import SkillsCloud from "../component/skill-cloud";
import GitHubStats from "../component/github-stats";
import ReputationBreakdown from "../component/reputation-breakdown";
import ReputationHistory from "../component/reputation-history";
import ContactPanel from "../component/contact-panel";
import EndorsementSection from "../component/endorsement-section";
import GitHubVerificationBadge from "../component/github-verification-badge";
import GitHubActivityBadge from "../component/github-activity-badge";
import PostCard from "@/app/companies/components/postCard";

// Hooks & UI
import useGithubVisibility from "@/hooks/useGithubVisibility";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Award,
  Zap,
  History,
  FileText,
  Trash2,
} from "lucide-react";

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

  const userId = profile?.user_id;

  const { data: reputation } = useReputation(userId);
  const { data: history } = useReputationHistory(userId);

  const { data: posts = [], isLoading: loadingPosts } = usePosts({
    authorId: userId,
    limit: 10,
  });

  const deletePost = useDeletePost();
  const { canShowGithub, canConnectGithub, isGithubConnected } =
    useGithubVisibility(profile, viewer);

  /* -------------------- CALLBACKS -------------------- */
  const handleDeletePost = (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    deletePost.mutate(postId, {
      onSuccess: () => {
        toast.success("Post deleted successfully!");
        queryClient.invalidateQueries({ queryKey: ["posts"] });
      },
      onError: () => {
        toast.error("Failed to delete post. Try again.");
      },
    });
  };

  useEffect(() => {
    if (handledParams.current || !username) return;

    if (searchParams.get("success") === "github_connected") {
      handledParams.current = true;
      toast.success("GitHub account connected.");
      queryClient.invalidateQueries({ queryKey: ["profile", username] });
      setSearchParams({}, { replace: true });
    }
  }, [username, searchParams, setSearchParams, queryClient]);

  if (loadingProfile) return <Skeleton className="h-96 rounded-3xl w-full" />;

  if (isError || !profile)
    return (
      <div className="p-20 text-center font-bold text-muted-foreground italic">
        User not found
      </div>
    );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 max-w-7xl mx-auto px-4">
      <ProfileHero
        user={{
          id: profile.user_id,
          name: profile.full_name,
          username: profile.username,
        }}
        reputation={reputation?.total ?? profile.reputation_score}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MAIN FEED */}
        <div className="lg:col-span-2 space-y-8">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="bg-muted/50 p-1 h-12 rounded-xl mb-6 flex overflow-x-auto no-scrollbar">
              <TabsTrigger value="overview">
                <Zap className="h-4 w-4 mr-1" /> Overview
              </TabsTrigger>

              <TabsTrigger value="posts">
                <FileText className="h-4 w-4 mr-1" /> Posts
                {posts.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {posts.length}
                  </Badge>
                )}
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

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-8 outline-none">
              {canShowGithub && (
                <>
                  <ReputationBreakdown
                    total={reputation?.total ?? profile.reputation_score}
                    breakdown={reputation?.breakdown}
                  />
                  <SkillsCloud skills={profile.skills ?? []} />

                  {canConnectGithub && !isGithubConnected && (
                    <button
                      onClick={initiateGithubAuth}
                      className="btn btn-github w-full"
                    >
                      🐙 Connect GitHub
                    </button>
                  )}

                  {isGithubConnected && (
                    <div className="space-y-6">
                      <GitHubStats
                        stats={{
                          stars: profile.total_stars,
                          prs: profile.pull_requests,
                          commits30d: profile.commits_30d,
                          username: profile.github_username,
                        }}
                      />
                      <div className="flex flex-wrap gap-2">
                        <GitHubVerificationBadge stats={profile} />
                        <GitHubActivityBadge stats={profile} />
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* POSTS TAB */}
            <TabsContent value="posts" className="space-y-4 outline-none">
              {loadingPosts ? (
                [1, 2].map((i) => (
                  <Skeleton key={i} className="h-40 w-full rounded-xl" />
                ))
              ) : posts.length > 0 ? (
                posts.map((post, idx) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    index={idx}
                    canDelete={viewer?.id === post.author_id}
                    onDelete={() => handleDeletePost(post.id)}
                  />
                ))
              ) : (
                <div className="text-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed">
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-muted-foreground font-medium">
                    No posts published yet
                  </p>
                </div>
              )}
            </TabsContent>

            {/* HISTORY & ENDORSEMENTS */}
            {canShowGithub && (
              <TabsContent value="history">
                <ReputationHistory events={history ?? []} />
              </TabsContent>
            )}

            {canShowGithub && viewer?.id !== userId && (
              <TabsContent value="endorsements">
                <EndorsementSection
                  skills={profile.skills ?? []}
                  userId={userId}
                />
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <ContactPanel
            userId={profile.user_id}
            userName={profile.full_name}
            isOwnProfile={viewer?.id === userId}
          />

          <div className="bg-card rounded-3xl border p-6 space-y-4 shadow-sm">
            <h3 className="font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-4 text-primary" /> Verification
            </h3>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge className="bg-green-500/10 text-green-600 border-none">
                Verified
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
