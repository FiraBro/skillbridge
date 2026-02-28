import { useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";
import {
  useProfile,
  useReputation,
  useReputationHistory,
} from "@/hooks/useProfiles";
import { usePosts, useDeletePost } from "@/hooks/usePosts";
import { initiateGithubAuth, disconnectGithub } from "@/lib/api";

// Components
import ProfileHero from "../component/profile-hero";
import SkillsCloud from "../component/skill-cloud";
import ReputationBreakdown from "../component/reputation-breakdown";
import ReputationHistory from "../component/reputation-history";
import ContactPanel from "../component/contact-panel";
import EndorsementSection from "../component/endorsement-section";
import PostCard from "@/app/companies/components/postCard";

// Hooks & UI
import useGithubVisibility from "@/hooks/useGithubVisibility";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Award,
  Zap,
  History,
  FileText,
  Github,
  Link2Off,
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
  const isOwnProfile = viewer?.id === userId;

  const { data: reputation } = useReputation(userId);
  const { data: history } = useReputationHistory(userId);
  const { data: posts = [], isLoading: loadingPosts } = usePosts({
    authorId: userId,
    limit: 10,
  });

  const deletePost = useDeletePost();
  const { canShowGithub, canConnectGithub, isGithubConnected } =
    useGithubVisibility(profile, viewer);

  /* -------------------- MUTATIONS -------------------- */
  const disconnectMutation = useMutation({
    mutationFn: disconnectGithub,
    onSuccess: () => {
      toast.success("GitHub disconnected successfully.");
      queryClient.invalidateQueries({ queryKey: ["profile", username] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to disconnect GitHub.");
    },
  });

  /* -------------------- CALLBACKS -------------------- */
  const handleDeletePost = (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    deletePost.mutate(postId, {
      onSuccess: () => {
        toast.success("Post deleted successfully!");
        queryClient.invalidateQueries({ queryKey: ["posts"] });
      },
    });
  };

  const handleDisconnectGithub = () => {
    if (
      confirm("Are you sure? This will remove your GitHub stats and badges.")
    ) {
      disconnectMutation.mutate();
    }
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
    return <div className="p-20 text-center italic">User not found</div>;

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
            </TabsList>

            <TabsContent value="overview" className="space-y-8 outline-none">
              {canShowGithub && (
                <>
                  <ReputationBreakdown
                    total={reputation?.total ?? profile.reputation_score}
                    breakdown={reputation?.breakdown}
                  />
                  <SkillsCloud skills={profile.skills ?? []} />

                  {/* CONNECT GITHUB CTA */}
                  {isOwnProfile && !isGithubConnected && (
                    <Button
                      onClick={initiateGithubAuth}
                      className="w-full h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white gap-2 text-lg font-bold"
                    >
                      <Github className="h-5 w-5" /> Connect GitHub Account
                    </Button>
                  )}

                  {/* GITHUB USERNAME & DISCONNECT */}
                  {isGithubConnected && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-4 p-4 border rounded-xl bg-muted/30">
                        <div className="flex items-center gap-3">
                          <Github className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">
                            {profile.github_username}
                          </span>
                        </div>
                        {isOwnProfile && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDisconnectGithub}
                            disabled={disconnectMutation.isPending}
                            className="text-muted-foreground hover:text-destructive gap-1"
                          >
                            <Link2Off className="h-4 w-4" />
                            {disconnectMutation.isPending
                              ? "Disconnecting..."
                              : "Disconnect"}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

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
                  <p className="text-muted-foreground font-medium">
                    No posts published yet
                  </p>
                </div>
              )}
            </TabsContent>

            {canShowGithub && (
              <TabsContent value="history">
                <ReputationHistory events={history ?? []} />
              </TabsContent>
            )}
          </Tabs>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24">
          <ContactPanel
            userId={profile.user_id}
            userName={profile.full_name}
            isOwnProfile={isOwnProfile}
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
