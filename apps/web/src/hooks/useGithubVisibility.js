import { useMemo } from "react";

/**
 * Determines GitHub feature visibility
 * @param {object} profile - Profile being viewed (from useProfile)
 * @param {object} viewer - The logged-in user (from useAuth)
 */
export default function useGithubVisibility(profile, viewer) {
  // 1. Identify roles and ownership
  const isOwner = useMemo(() => {
    return viewer?.id && profile?.user_id && viewer.id === profile.user_id;
  }, [viewer?.id, profile?.user_id]);

  const isAdmin = viewer?.role === "admin";

  // 2. Check if GitHub is actually connected in the database
  const githubConnected = Boolean(profile?.github_username);

  /**
   * canShowGithub:
   * Controls the "Overview" section (Reputation, Skills).
   * Should be TRUE for any valid profile so that companies/devs can see stats.
   */
  const canShowGithub = useMemo(() => {
    return Boolean(profile && profile.user_id);
  }, [profile]);

  /**
   * canConnectGithub:
   * Controls the "Connect GitHub" CTA button.
   * Only the profile OWNER should see this, and only if they haven't connected yet.
   */
  const canConnectGithub = useMemo(() => {
    return isOwner && !githubConnected;
  }, [isOwner, githubConnected]);

  /**
   * isGithubConnected:
   * Controls live stats (Stars, Commits, PRs).
   * TRUE only if the data exists in the profile.
   */
  const isGithubConnected = useMemo(() => {
    return githubConnected;
  }, [githubConnected]);

  return {
    canShowGithub, // Opens the Reputation/Skills section for everyone
    canConnectGithub, // Shows the "Connect" button only to the owner
    isGithubConnected, // Determines if GitHub-specific badges/stats show up
    isOwner, // Useful for other UI logic
    isAdmin,
  };
}
