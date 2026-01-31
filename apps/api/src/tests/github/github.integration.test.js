import request from 'supertest';
import { app } from '../../app.js';
import { pool } from '../../config/db.js';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

describe('GitHub Integration API', () => {
  let authToken;
  let userId;
  let profileId;

  beforeAll(async () => {
    // Create a test user and get auth token
    const userData = {
      email: 'github-test@example.com',
      password: 'password123',
      name: 'GitHub Test User'
    };

    // Register user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    userId = registerRes.body.user.id;
    authToken = registerRes.body.token;

    // Create profile for the user
    const profileData = {
      username: 'github-test-user',
      fullName: 'GitHub Test User',
      bio: 'Test user for GitHub integration',
      location: 'Test Location'
    };

    const profileRes = await request(app)
      .post('/api/profiles')
      .set('Authorization', `Bearer ${authToken}`)
      .send(profileData)
      .expect(201);

    profileId = profileRes.body.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (userId) {
      await pool.query('DELETE FROM profiles WHERE user_id = $1', [userId]);
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    }
  });

  describe('GET /api/github/auth/github', () => {
    it('should redirect to GitHub OAuth URL when authenticated', async () => {
      const response = await request(app)
        .get('/api/github/auth/github')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(302);

      expect(response.headers.location).toContain('github.com/login/oauth/authorize');
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .get('/api/github/auth/github')
        .expect(401);
    });
  });

  describe('GET /api/github/profile/:username', () => {
    it('should return GitHub profile data when exists', async () => {
      // First connect a GitHub account (mock data in DB)
      await pool.query(
        `UPDATE users 
         SET github_username = $1, github_id = $2, github_verified = true 
         WHERE id = $3`,
        ['testuser', 123456, userId]
      );

      await pool.query(
        `INSERT INTO github_stats 
         (profile_id, public_repos, followers, total_stars, total_commits, commits_30d, is_active, last_activity, account_created, last_synced_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
        [profileId, 5, 10, 25, 100, 15, true, new Date(), new Date()]
      );

      const response = await request(app)
        .get('/api/github/profile/github-test-user')
        .expect(200);

      expect(response.body).toHaveProperty('profile');
      expect(response.body).toHaveProperty('github');
      expect(response.body.github.stats).toBeDefined();
    });

    it('should return 404 when GitHub profile does not exist', async () => {
      const response = await request(app)
        .get('/api/github/profile/nonexistent-user')
        .expect(404);

      expect(response.body.error).toBe('User not found');
    });
  });

  describe('POST /api/github/sync', () => {
    it('should sync GitHub data when authenticated', async () => {
      const response = await request(app)
        .post('/api/github/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'GitHub data synced successfully'
      });
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .post('/api/github/sync')
        .send({})
        .expect(401);
    });
  });

  describe('DELETE /api/github/disconnect', () => {
    it('should disconnect GitHub account when authenticated', async () => {
      const response = await request(app)
        .delete('/api/github/disconnect')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'GitHub account disconnected successfully'
      });
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .delete('/api/github/disconnect')
        .expect(401);
    });
  });

  describe('PATCH /api/github/pinned-repos', () => {
    it('should update pinned repositories when authenticated', async () => {
      const response = await request(app)
        .patch('/api/github/pinned-repos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ pinnedRepos: ['repo1', 'repo2'] })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Pinned repositories updated'
      });
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .patch('/api/github/pinned-repos')
        .send({ pinnedRepos: ['repo1'] })
        .expect(401);
    });
  });

  describe('PATCH /api/github/hidden-repos', () => {
    it('should update hidden repositories when authenticated', async () => {
      const response = await request(app)
        .patch('/api/github/hidden-repos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ hiddenRepos: ['repo3'] })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'Hidden repositories updated'
      });
    });

    it('should return 401 when not authenticated', async () => {
      await request(app)
        .patch('/api/github/hidden-repos')
        .send({ hiddenRepos: ['repo3'] })
        .expect(401);
    });
  });
});