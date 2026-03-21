import { useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useReputationHistory } from "@/hooks/useProfiles";
import { usePosts, useDeletePost } from "@/hooks/usePosts";
import { initiateGithubAuth, disconnectGithub } from "@/lib/api";

// Components
import ProfileHero from "../component/profile-hero";
import ReputationHistory from "../component/reputation-history";
import ContactPanel from "../component/contact-panel";
import PostCard from "@/app/companies/components/postCard";

// Hooks & UI
import useGithubVisibility from "@/hooks/useGithubVisibility";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, Settings, UserCircle, ExternalLink } from "lucide-react";

export default function ProfilePage() {
  const { username } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user: viewer } = useAuth();
  const lastHandledUser = useRef(null);

  const {
    data: profile,
    isLoading: loadingProfile,
    isError,
    refetch,
  } = useProfile(username);
  const userId = profile?.user_id;
  console.log("user id:", userId);

  const isOwnProfile = viewer?.id === userId;
  console.log("is profile:", isOwnProfile);

  const { data: history } = useReputationHistory(userId);
  const { data: posts = [] } = usePosts({ authorId: userId, limit: 10 });
  const { isGithubConnected } = useGithubVisibility(profile, viewer);
  const deletePostMutation = useDeletePost();

  const disconnectMutation = useMutation({
    mutationFn: disconnectGithub,
    onSuccess: () => {
      toast.success("GitHub disconnected.");
      queryClient.invalidateQueries({ queryKey: ["profile", username] });
    },
  });

  const handleDeletePost = (postId) => {
    if (!window.confirm("Delete this post?")) return;
    deletePostMutation.mutate(postId, {
      onSuccess: () => {
        toast.success("Post removed");
        queryClient.invalidateQueries({ queryKey: ["posts", userId] });
      },
    });
  };

  useEffect(() => {
    if (
      searchParams.get("success") === "github_connected" &&
      lastHandledUser.current !== username
    ) {
      lastHandledUser.current = username;
      toast.success("GitHub connected!");
      queryClient.invalidateQueries({ queryKey: ["profile", username] });
      setSearchParams({}, { replace: true });
    }
  }, [username, searchParams, setSearchParams, queryClient]);

  if (loadingProfile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 space-y-6">
        <Skeleton className="h-48 md:h-64 rounded-[2rem] w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-[400px] rounded-3xl" />
          <Skeleton className="h-[300px] rounded-3xl" />
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <UserCircle className="h-16 w-16 text-muted-foreground/20 mb-4" />
        <h2 className="text-2xl font-bold">Profile not found</h2>
        <Button className="mt-4 rounded-xl" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 space-y-6 md:space-y-10 animate-in fade-in duration-500">
      {/* Hero Section - Responsive inner padding handled in ProfileHero */}
      <ProfileHero
        user={{
          id: profile.user_id,
          name: profile.full_name,
          username: profile.username,
        }}
        reputation={profile.reputation_score}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Main Feed Area */}
        <div className="lg:col-span-2 order-2 lg:order-1 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            {/* Scrollable Tabs for Mobile */}
            <div className="relative mb-6">
              <TabsList className="flex w-full justify-start overflow-x-auto no-scrollbar bg-muted/30 p-1 h-12 rounded-2xl border backdrop-blur-sm scroll-smooth items-center">
                <TabsTrigger
                  value="overview"
                  className="min-w-[100px] rounded-xl px-4"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="posts"
                  className="min-w-[100px] rounded-xl px-4"
                >
                  Posts
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="min-w-[100px] rounded-xl px-4"
                >
                  Activity
                </TabsTrigger>
                {isOwnProfile && (
                  <TabsTrigger
                    value="settings"
                    className="min-w-[100px] rounded-xl px-4 text-primary font-semibold ml-auto"
                  >
                    <Settings className="h-4 w-4" />
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            {/* OVERVIEW CONTENT */}
            <TabsContent value="overview" className="outline-none m-0">
              <section className="p-5 md:p-8 border rounded-[2rem] bg-card shadow-sm border-border/60">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Github className="h-5 w-5" /> GitHub Integration
                  </h3>
                  {isGithubConnected && (
                    <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 border-none px-3 py-1 rounded-full">
                      Connected
                    </Badge>
                  )}
                </div>

                {!isGithubConnected ? (
                  <div className="bg-muted/10 border-2 border-dashed rounded-3xl p-8 md:p-12 text-center">
                    <p className="text-muted-foreground mb-6 text-sm md:text-base">
                      Sync your repositories to display your coding reputation.
                    </p>
                    <Button
                      onClick={initiateGithubAuth}
                      className="w-full sm:w-auto h-12 px-8 rounded-xl bg-zinc-900 font-bold"
                    >
                      Connect Account
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-between p-4 md:p-6 border rounded-2xl bg-muted/20 gap-4">
                    <div className="flex items-center gap-4 w-full">
                      <div className="bg-zinc-950 p-3 rounded-xl">
                        <Github className="h-6 w-6 text-white" />
                      </div>
                      <div className="truncate">
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                          Linked Account
                        </p>
                        <a
                          href={`https://github.com/${profile.github_username}`}
                          target="_blank"
                          className="text-lg font-bold flex items-center gap-1 hover:text-primary"
                        >
                          @{profile.github_username}{" "}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                    {isOwnProfile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => disconnectMutation.mutate()}
                        className="w-full sm:w-auto text-destructive hover:bg-destructive/10"
                      >
                        Disconnect
                      </Button>
                    )}
                  </div>
                )}
              </section>
            </TabsContent>

            {/* POSTS CONTENT */}
            <TabsContent value="posts" className="space-y-4 m-0">
              {posts.length > 0 ? (
                posts.map((post, idx) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    index={idx}
                    canDelete={isOwnProfile}
                    onDelete={() => handleDeletePost(post.id)}
                  />
                ))
              ) : (
                <div className="py-20 text-center bg-muted/5 rounded-[2rem] border-2 border-dashed border-border/40">
                  <p className="text-muted-foreground">
                    No public insights yet.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="m-0">
              <ReputationHistory events={history ?? []} />
            </TabsContent>

            <TabsContent
              value="settings"
              className="p-6 md:p-8 border rounded-[2rem] bg-card m-0"
            >
              <h3 className="text-xl font-bold mb-6">Profile Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-20 justify-start px-6 rounded-2xl group transition-all"
                >
                  <div className="text-left">
                    <p className="font-bold group-hover:text-primary transition-colors">
                      Personal Info
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Bio & Avatar
                    </p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 justify-start px-6 rounded-2xl group transition-all"
                >
                  <div className="text-left">
                    <p className="font-bold group-hover:text-primary transition-colors">
                      Account Security
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Login & Pass
                    </p>
                  </div>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Stacks on bottom for Mobile, sticks on Right for Desktop */}
        <div className="lg:col-span-1 order-1 lg:order-2 space-y-6">
          <div className="sticky top-6 space-y-6">
            <ContactPanel
              userId={profile.user_id}
              userName={profile.full_name}
              isOwnProfile={isOwnProfile}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
