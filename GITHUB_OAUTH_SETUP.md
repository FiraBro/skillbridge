# GitHub OAuth App Setup for SkillBridge

## Prerequisites
- A GitHub account
- Access to the GitHub developer settings
- Your deployed application URL (or localhost for development)

## Step-by-Step Setup

### 1. Create a GitHub OAuth App
1. Go to GitHub → Settings → Developer settings
2. Click "OAuth Apps" → "New OAuth App"
3. Fill in the application details:

**Application Name**: SkillBridge Dev (or your preferred name)
**Homepage URL**: http://localhost:5173 (or your frontend URL)
**Authorization callback URL**: http://localhost:6000/api/github/auth/github/callback

⚠️ **Important**: The "Authorization callback URL" must match exactly with your `GITHUB_CALLBACK_URL` environment variable.

### 2. Get Client Credentials
After creating the app, you'll receive:
- **Client ID**: Store as `GITHUB_CLIENT_ID` environment variable
- **Client Secret**: Store as `GITHUB_CLIENT_SECRET` environment variable

### 3. Environment Configuration
Create/update your `.env` file in the `apps/api` directory:

```env
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
GITHUB_CALLBACK_URL=http://localhost:6000/api/github/auth/github/callback
FRONTEND_URL=http://localhost:5173
```

### 4. Test the Setup
1. Start your backend server: `cd apps/api && npm run dev`
2. Start your frontend server: `cd apps/web && npm run dev`
3. Navigate to your frontend application
4. Try connecting GitHub account

### 5. Troubleshooting Common Issues

#### Issue: "Missing state parameter" error
**Cause**: The callback URL in GitHub app settings doesn't match your backend configuration
**Solution**: Verify that the Authorization callback URL in GitHub matches your `GITHUB_CALLBACK_URL`

#### Issue: "401 Unauthorized" when initiating OAuth
**Cause**: The "Connect GitHub" button was clicked without proper authentication
**Solution**: Ensure the user is logged in before clicking the connect button

#### Issue: Callback redirects to an invalid page
**Cause**: FRONTEND_URL environment variable is not set correctly
**Solution**: Set FRONTEND_URL to your actual frontend URL (e.g., http://localhost:5173)

### 6. Production Configuration
For production deployments, update the URLs accordingly:
- **Homepage URL**: Your production domain (e.g., https://skillbridge.com)
- **Authorization callback URL**: Your production API domain (e.g., https://api.skillbridge.com/api/github/auth/github/callback)

Example production `.env`:
```env
GITHUB_CLIENT_ID=your_production_client_id
GITHUB_CLIENT_SECRET=your_production_client_secret
GITHUB_CALLBACK_URL=https://api.skillbridge.com/api/github/auth/github/callback
FRONTEND_URL=https://skillbridge.com
```

### 7. Required Scopes
The SkillBridge GitHub integration uses these scopes:
- `read:user` - To read user profile information
- `repo` - To access repository information

These scopes are requested automatically during the OAuth flow.

### 8. Security Notes
- Never commit client secrets to version control
- Use environment variables for all credentials
- The state parameter provides CSRF protection
- Tokens are encrypted before storage in the database