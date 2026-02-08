import { useMemo } from "react";

/**
 * Determines GitHub feature visibility
 * @param {object} profile - Profile being viewed
 * @param {object} viewer - Logged-in user
 */
export default function useGithubVisibility(profile, viewer) {
  // Safety guards
  const viewerRole = viewer?.role;
  const isDeveloper = viewerRole === "developer";
  const isAdmin = viewerRole === "admin";

  // Ownership (ID-based, safest)
  const isOwner = viewer?.id === profile?.user_id;

  // GitHub connection check (REAL backend fields)
  const githubConnected = Boolean(profile?.github_username);

  /**
   * GitHub features are visible when:
   * - Profile exists
   * - Profile belongs to a developer
   * - Admins can always see
   */
  const canShowGithub = useMemo(() => {
    return Boolean(profile) && (isDeveloper || isAdmin);
  }, [profile, isDeveloper, isAdmin]);

  /**
   * Connect button rules:
   * - Developer profile
   * - Owner is viewing
   * - GitHub NOT connected
   */
  const canConnectGithub = useMemo(() => {
    return canShowGithub && isOwner && !githubConnected;
  }, [canShowGithub, isOwner, githubConnected]);

  /**
   * GitHub data visibility
   */
  const isGithubConnected = useMemo(() => {
    return canShowGithub && githubConnected;
  }, [canShowGithub, githubConnected]);

  return {
    canShowGithub,
    canConnectGithub,
    isGithubConnected,
  };
}
