// apps/web/src/app/profile/[id]/page.jsx
import { Suspense } from "react";
import { useDeveloperProfile } from "../hook/useDeveloper";
import ProfileHero from "../component/profile-hero";
import SkillsCloud from "../component/skill-cloud";
import GitHubStats from "../component/github-stats";
import ReputationBar from "../component/reputation-bar";
import LoadingSkeleton from "./loading";
import { useParams } from "react-router-dom";
import { ErrorBoundary } from "../component/error-boundary";
// import
export default function ProfilePage({ params }) {
  const { id } = useParams();

  return (
    <div className="container max-w-5xl mx-auto px-4 py-10 space-y-8">
      <ErrorBoundary
        fallback={<div className="text-center py-20">Profile unavailable.</div>}
      >
        <Suspense fallback={<LoadingSkeleton />}>
          <ProfileContent id={id} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

function ProfileContent({ id }) {
  const { data, isLoading } = useDeveloperProfile(id);

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content (Left) */}
      <div className="lg:col-span-2 space-y-8">
        <ProfileHero user={data.user} reputation={data.reputation} />
        <SkillsCloud skills={data.skills} />

        <div className="flex gap-4">
          <button className="flex-1 bg-primary text-primary-foreground h-12 rounded-xl font-bold hover:opacity-90 transition-all">
            Hire This Developer
          </button>
          <button className="flex-1 border border-border h-12 rounded-xl font-bold hover:bg-secondary/50 transition-all">
            View Portfolio
          </button>
        </div>
      </div>

      {/* Sidebar (Right) */}
      <div className="space-y-6">
        <GitHubStats stats={data.githubStats} />
        <ReputationBar reputation={data.reputation} />

        <div className="p-4 rounded-xl border bg-card text-xs text-muted-foreground">
          <p>Verified via Skillbridge Protocol</p>
          <p>
            Member since {new Date(data.user.joinedDate).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
