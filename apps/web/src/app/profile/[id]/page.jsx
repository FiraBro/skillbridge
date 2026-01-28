// apps/web/src/app/profile/[id]/page.jsx
import { Suspense } from "react";
import { useDeveloperProfile } from "../hook/useDeveloper";
import ProfileHero from "../component/profile-hero";
import SkillsCloud from "../component/skill-cloud";
import GitHubStats from "../component/github-stats";
import ReputationBar from "../component/reputation-bar";
import ContactPanel from "../component/contact-panel";
import LoadingSkeleton from "./loading";
import { useParams } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";

export default function ProfilePage({ params }) {
  // ... (rest of the component)
}

function ProfileContent({ id }) {
  const { data, isLoading } = useDeveloperProfile(id);
  // Ideally, you'd have the current authenticated user ID here
  const currentUserId = null; // Replace with auth hook
  const isOwnProfile = currentUserId === data?.user?.id;

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content (Left) */}
      <div className="lg:col-span-2 space-y-8">
        <ProfileHero user={data.user} reputation={data.reputation} />
        <SkillsCloud skills={data.skills} />

        {/* Contact System */}
        <ContactPanel
          userId={data.user.id}
          userName={data.user.name}
          isOwnProfile={isOwnProfile}
        />
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
