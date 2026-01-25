import * as repo from "./repository.profile.js";
import github from "../services/github.service.js"; // No asterisk, no curly braces
import { calculateReputation } from "../services/reputation.engine.js";
export async function createProfile(payload) {
  return repo.createProfile(payload);
}

export async function getPublicProfile(username) {
  const profile = await repo.getProfileByUsername(username);
  if (!profile) throw new Error("Profile not found");
  return profile;
}

export async function syncGithub(profile) {
  if (!profile.github_username) return;

  const stats = await github.fetchDeveloperStats(profile.github_username);

  await repo.upsertGithubStats(profile.id, stats);

  const reputation = calculateReputation({
    skillsCount: profile.skills?.length || 0,
    githubStats: stats,
    joinedAt: profile.joined_at,
  });

  await repo.updateReputation(profile.id, reputation);
}
