import * as repo from "./repository.profile.js";
import github from "../services/github.service.js";
import { calculateReputation } from "../services/reputation.engine.js";
import ApiError from "../utils/apiError.js";

export async function getPublicProfile(username) {
  const profile = await repo.getProfileByUsername(username);
  if (!profile) throw new ApiError(404, "Profile not found");
  return profile;
}

export async function syncGithub(profile, forceUsername = null) {
  // Logic: Use provided name, or name in profile, or (newly added) name from the user object
  const githubName = forceUsername || profile.github_username;

  if (!githubName) {
    console.log(
      "Sync skipped: No GitHub username found for profile",
      profile.id,
    );
    return;
  }

  // 1. Fetch fresh stats
  const stats = await github.fetchDeveloperStats(githubName);

  // 2. Save stats to the DB
  await repo.upsertGithubStats(profile.id, {
    ...stats,
    github_username: githubName,
  });

  // 3. Calculate Reputation using the 33 repos and 14 stars we saw in your log
  const reputation = calculateReputation({
    skillsCount: profile.skills?.length || 0,
    githubStats: stats,
    joinedAt: profile.joined_at,
  });

  // 4. Save the reputation score
  await repo.updateReputation(profile.id, reputation);

  return { stats, reputation };
}
