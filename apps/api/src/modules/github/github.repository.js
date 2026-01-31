import { pool } from "../../config/db.js";

class GitHubRepository {
  async attachGitHubAccount({ userId, githubId, username, avatar }) {
    await pool.query(
      `
      UPDATE users
      SET github_id = $1,
          github_username = $2,
          github_verified = true,
          github_connected_at = NOW()
      WHERE id = $3
      `,
      [githubId, username, userId],
    );
  }

  async saveGitHubStats({ userId, stats, avatar }) {
    // First get the profile ID
    const profileResult = await pool.query(
      "SELECT id FROM profiles WHERE user_id = $1",
      [userId],
    );

    if (profileResult.rows.length === 0) {
      throw new Error("Profile not found for user");
    }

    const profileId = profileResult.rows[0].id;

    // Ensure JSONB columns get valid JSON (arrays/objects only)
    const topLanguages = stats.topLanguages ?? stats.top_languages;
    const topLanguagesJson = Array.isArray(topLanguages)
      ? JSON.stringify(topLanguages.map((l) => (l != null ? String(l) : "")))
      : "[]";
    const weeklyActivity = stats.weeklyActivity ?? stats.weekly_activity;
    const weeklyActivityJson =
      weeklyActivity && typeof weeklyActivity === "object" && !Array.isArray(weeklyActivity)
        ? JSON.stringify(weeklyActivity)
        : "{}";
    const mostActiveDays = stats.mostActiveDays ?? stats.most_active_days;
    const mostActiveDaysJson =
      mostActiveDays && typeof mostActiveDays === "object" && !Array.isArray(mostActiveDays)
        ? JSON.stringify(mostActiveDays)
        : "{}";

    // Upsert into github_stats table
    await pool.query(
      `
      INSERT INTO github_stats
        (profile_id, public_repos, followers, total_stars, total_commits,
         commits_30d, is_active, last_activity, account_created, last_synced_at,
         top_languages, contribution_streak, consistency_score, github_bio,
         github_following, account_age_months, weekly_activity, most_active_days,
         verification_status, last_sync_with_github)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(),
              $10::jsonb, $11, $12, $13, $14, $15, $16::jsonb, $17::jsonb, $18, NOW())
      ON CONFLICT (profile_id)
      DO UPDATE SET
        public_repos = EXCLUDED.public_repos,
        followers = EXCLUDED.followers,
        total_stars = EXCLUDED.total_stars,
        total_commits = EXCLUDED.total_commits,
        commits_30d = EXCLUDED.commits_30d,
        is_active = EXCLUDED.is_active,
        last_activity = EXCLUDED.last_activity,
        account_created = EXCLUDED.account_created,
        last_synced_at = NOW(),
        top_languages = EXCLUDED.top_languages,
        contribution_streak = EXCLUDED.contribution_streak,
        consistency_score = EXCLUDED.consistency_score,
        github_bio = EXCLUDED.github_bio,
        github_following = EXCLUDED.github_following,
        account_age_months = EXCLUDED.account_age_months,
        weekly_activity = EXCLUDED.weekly_activity,
        most_active_days = EXCLUDED.most_active_days,
        verification_status = EXCLUDED.verification_status,
        last_sync_with_github = NOW()
      `,
      [
        profileId,
        stats.publicRepos ?? stats.public_repos,
        stats.followers,
        stats.totalStars ?? stats.total_stars,
        stats.totalCommits ?? stats.total_commits,
        stats.commits30d ?? stats.commits_30d ?? 0,
        stats.isActive ?? stats.is_active ?? false,
        stats.lastActivity ?? stats.last_activity ?? null,
        stats.accountCreated ?? stats.account_created ?? null,
        topLanguagesJson,
        stats.contributionStreak ?? stats.contribution_streak ?? 0,
        stats.consistencyScore ?? stats.consistency_score ?? 0.0,
        stats.githubBio ?? stats.github_bio ?? null,
        stats.githubFollowing ?? stats.github_following ?? 0,
        stats.accountAgeMonths ?? stats.account_age_months ?? 0,
        weeklyActivityJson,
        mostActiveDaysJson,
        stats.verificationStatus ?? stats.verification_status ?? "verified",
      ],
    );
  }

  async saveGitHubRepositories(userId, repositories) {
    // First get the profile ID
    const profileResult = await pool.query(
      "SELECT id FROM profiles WHERE user_id = $1",
      [userId],
    );

    if (profileResult.rows.length === 0) {
      throw new Error("Profile not found for user");
    }

    const profileId = profileResult.rows[0].id;

    // Clear existing repositories for this profile
    await pool.query("DELETE FROM github_repositories WHERE profile_id = $1", [
      profileId,
    ]);

    if (repositories && repositories.length > 0) {
      // Prepare values for bulk insert
      const values = repositories
        .map((repo, index) => {
          const baseIndex = index * 11; // 11 parameters per repo
          return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4},
                 $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8},
                 $${baseIndex + 9}, $${baseIndex + 10}, $${baseIndex + 11})`;
        })
        .join(", ");

      const params = [];
      repositories.forEach((repo) => {
        params.push(
          profileId,
          repo.name,
          repo.description || null,
          repo.stars || 0,
          repo.forks || 0,
          repo.language || null,
          repo.last_updated ? new Date(repo.last_updated) : null,
          repo.is_pinned || false,
          repo.is_hidden || false,
          repo.is_public !== false, // default to true
          repo.custom_description || null,
        );
      });

      await pool.query(
        `INSERT INTO github_repositories
          (profile_id, name, description, stars, forks, language, last_updated,
           is_pinned, is_hidden, is_public, custom_description)
         VALUES ${values}`,
        params,
      );
    }
  }

  async getGitHubData(userId) {
    const profileResult = await pool.query(
      "SELECT id FROM profiles WHERE user_id = $1",
      [userId],
    );

    if (profileResult.rows.length === 0) {
      return null;
    }

    const profileId = profileResult.rows[0].id;

    // Get GitHub stats
    const statsResult = await pool.query(
      "SELECT * FROM github_stats WHERE profile_id = $1",
      [profileId],
    );

    // Get GitHub repositories
    const reposResult = await pool.query(
      "SELECT * FROM github_repositories WHERE profile_id = $1 ORDER BY stars DESC",
      [profileId],
    );

    return {
      stats: statsResult.rows[0] || null,
      repositories: reposResult.rows,
    };
  }

  async updatePinnedRepos(userId, pinnedRepoNames) {
    const profileResult = await pool.query(
      "SELECT id FROM profiles WHERE user_id = $1",
      [userId],
    );

    if (profileResult.rows.length === 0) {
      throw new Error("Profile not found for user");
    }

    const profileId = profileResult.rows[0].id;

    // First, unpin all repos for this profile
    await pool.query(
      "UPDATE github_repositories SET is_pinned = false WHERE profile_id = $1",
      [profileId],
    );

    // Then pin the specified repos
    if (pinnedRepoNames && pinnedRepoNames.length > 0) {
      const placeholders = pinnedRepoNames
        .map((_, i) => `$${i + 1}`)
        .join(", ");
      await pool.query(
        `UPDATE github_repositories SET is_pinned = true
         WHERE profile_id = $1 AND name IN (${placeholders})`,
        [profileId, ...pinnedRepoNames],
      );
    }
  }

  async updateHiddenRepos(userId, hiddenRepoNames) {
    const profileResult = await pool.query(
      "SELECT id FROM profiles WHERE user_id = $1",
      [userId],
    );

    if (profileResult.rows.length === 0) {
      throw new Error("Profile not found for user");
    }

    const profileId = profileResult.rows[0].id;

    // First, unhide all repos for this profile
    await pool.query(
      "UPDATE github_repositories SET is_hidden = false WHERE profile_id = $1",
      [profileId],
    );

    // Then hide the specified repos
    if (hiddenRepoNames && hiddenRepoNames.length > 0) {
      const placeholders = hiddenRepoNames
        .map((_, i) => `$${i + 1}`)
        .join(", ");
      await pool.query(
        `UPDATE github_repositories SET is_hidden = true
         WHERE profile_id = $1 AND name IN (${placeholders})`,
        [profileId, ...hiddenRepoNames],
      );
    }
  }

  async deleteGitHubStats(profileId) {
    await pool.query("DELETE FROM github_stats WHERE profile_id = $1", [
      profileId,
    ]);
  }

  async deleteGitHubRepositories(profileId) {
    await pool.query("DELETE FROM github_repositories WHERE profile_id = $1", [
      profileId,
    ]);
  }

  async detachGitHubAccount(userId) {
    await pool.query(
      `UPDATE users
       SET github_id = NULL,
           github_username = NULL,
           github_verified = false,
           github_connected_at = NULL
       WHERE id = $1`,
      [userId],
    );
  }
}

export default new GitHubRepository();
