import { pool } from "../../config/db.js";

class GitHubRepository {
  /* =========================================================
     ATTACH GITHUB ACCOUNT
  ========================================================= */
  async attachGitHubAccount({ userId, githubId, username }) {
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

  /* =========================================================
     SAVE ALL GITHUB DATA ATOMICALLY (FIX)
  ========================================================= */
  async saveGitHubDataAtomic({ userId, stats, repositories }) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1️⃣ Ensure profile exists
      const profileRes = await client.query(
        "SELECT id FROM profiles WHERE user_id = $1",
        [userId],
      );

      if (!profileRes.rows.length) {
        throw new Error("Profile not found for user");
      }

      const profileId = profileRes.rows[0].id;

      // Normalize JSON fields
      const topLanguages = Array.isArray(stats.topLanguages)
        ? JSON.stringify(stats.topLanguages)
        : "[]";

      const weeklyActivity =
        stats.weeklyActivity && typeof stats.weeklyActivity === "object"
          ? JSON.stringify(stats.weeklyActivity)
          : "{}";

      const mostActiveDays =
        stats.mostActiveDays && typeof stats.mostActiveDays === "object"
          ? JSON.stringify(stats.mostActiveDays)
          : "{}";

      // 2️⃣ Upsert github_stats
      await client.query(
        `
        INSERT INTO github_stats (
          profile_id,
          public_repos,
          followers,
          total_stars,
          total_commits,
          commits_30d,
          contribution_streak,
          consistency_score,
          github_bio,
          github_following,
          account_age_months,
          top_languages,
          weekly_activity,
          most_active_days,
          verification_status,
          last_sync_with_github
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,
          $12::jsonb,$13::jsonb,$14::jsonb,$15,NOW()
        )
        ON CONFLICT (profile_id)
        DO UPDATE SET
          public_repos = EXCLUDED.public_repos,
          followers = EXCLUDED.followers,
          total_stars = EXCLUDED.total_stars,
          total_commits = EXCLUDED.total_commits,
          commits_30d = EXCLUDED.commits_30d,
          contribution_streak = EXCLUDED.contribution_streak,
          consistency_score = EXCLUDED.consistency_score,
          github_bio = EXCLUDED.github_bio,
          github_following = EXCLUDED.github_following,
          account_age_months = EXCLUDED.account_age_months,
          top_languages = EXCLUDED.top_languages,
          weekly_activity = EXCLUDED.weekly_activity,
          most_active_days = EXCLUDED.most_active_days,
          verification_status = EXCLUDED.verification_status,
          last_sync_with_github = NOW()
        `,
        [
          profileId,
          stats.publicRepos ?? 0,
          stats.followers ?? 0,
          stats.totalStars ?? 0,
          stats.totalCommits ?? 0,
          stats.commits30d ?? 0,
          stats.contributionStreak ?? 0,
          stats.consistencyScore ?? 0,
          stats.githubBio ?? null,
          stats.githubFollowing ?? 0,
          stats.accountAgeMonths ?? 0,
          topLanguages,
          weeklyActivity,
          mostActiveDays,
          stats.verificationStatus ?? "verified",
        ],
      );

      // 3️⃣ Replace repositories (safe)
      await client.query(
        "DELETE FROM github_repositories WHERE profile_id = $1",
        [profileId],
      );

      if (Array.isArray(repositories)) {
        for (const repo of repositories) {
          await client.query(
            `
            INSERT INTO github_repositories (
              profile_id,
              name,
              description,
              stars,
              forks,
              language,
              last_updated,
              is_public
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            `,
            [
              profileId,
              repo.name,
              repo.description || null,
              repo.stars ?? 0,
              repo.forks ?? 0,
              repo.language || null,
              repo.last_updated ? new Date(repo.last_updated) : null,
              repo.is_public !== false,
            ],
          );
        }
      }

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  /* =========================================================
     FETCH GITHUB DATA
  ========================================================= */
  async getGitHubData(userId) {
    const profileRes = await pool.query(
      "SELECT id FROM profiles WHERE user_id = $1",
      [userId],
    );

    if (!profileRes.rows.length) return null;

    const profileId = profileRes.rows[0].id;

    const statsRes = await pool.query(
      "SELECT * FROM github_stats WHERE profile_id = $1",
      [profileId],
    );

    const reposRes = await pool.query(
      "SELECT * FROM github_repositories WHERE profile_id = $1 ORDER BY stars DESC",
      [profileId],
    );

    return {
      stats: statsRes.rows[0] || null,
      repositories: reposRes.rows,
    };
  }

  /* =========================================================
     DISCONNECT GITHUB (SAFE)
  ========================================================= */
  async disconnectGitHubAccount(userId) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const profileRes = await client.query(
        "SELECT id FROM profiles WHERE user_id = $1",
        [userId],
      );

      if (profileRes.rows.length) {
        const profileId = profileRes.rows[0].id;
        await client.query(
          "DELETE FROM github_repositories WHERE profile_id = $1",
          [profileId],
        );
        await client.query("DELETE FROM github_stats WHERE profile_id = $1", [
          profileId,
        ]);
      }

      await client.query(
        `
        UPDATE users
        SET github_id = NULL,
            github_username = NULL,
            github_verified = false,
            github_connected_at = NULL
        WHERE id = $1
        `,
        [userId],
      );

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
}

export default new GitHubRepository();
