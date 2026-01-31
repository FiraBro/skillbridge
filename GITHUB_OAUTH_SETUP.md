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

### 4. Test the Full OAuth Flow Locally

**Step 1 – Confirm GitHub OAuth App callback URL**

- In GitHub: **Settings → Developer settings → OAuth Apps** → your app.
- Set **Authorization callback URL** to exactly:
  - `http://localhost:6000/api/github/auth/github/callback`
- Do **not** use the frontend URL (e.g. `http://localhost:5173/...`) here. GitHub must redirect to the **backend** so the callback route is hit.

**Step 2 – Start backend and frontend**

```bash
# Terminal 1 – backend (port 6000)
cd apps/api && npm run dev

# Terminal 2 – frontend (port 5173)
cd apps/web && npm run dev
```

On startup, the API logs the callback URL it expects. It must match the one in GitHub.

**Step 3 – Initiate OAuth from the app**

1. Open **http://localhost:5173** in the browser.
2. Log in so you have a valid JWT (cookie or `Authorization` header).
3. Go to the page that has “Connect GitHub” (e.g. profile/settings).
4. Click **Connect GitHub**. The frontend should call:
   - `GET http://localhost:6000/api/github/auth/github` (with auth).
5. You are redirected to GitHub to authorize.
6. After authorizing, GitHub redirects the browser to:
   - `http://localhost:6000/api/github/auth/github/callback?code=...&state=...`
7. The **backend** handles that URL, exchanges the code, then redirects you to the frontend (e.g. `http://localhost:5173/profile?success=github_connected` or `/profile/<username>?success=github_connected`).

**Step 4 – Verify the callback is hit**

- When GitHub redirects to the callback, the backend must log an **INCOMING REQUEST** for `GET /api/github/auth/github/callback`. If you never see that line, the request is not reaching the backend (see debugging below).

**Manual check that the callback route is reachable**

- With the backend running, open in the browser or run:
  - `curl -v "http://localhost:6000/api/github/auth/github/callback?code=test&state=eyJ1c2VySWQiOiJ0ZXN0In0="`
- You should see the backend log: `INCOMING REQUEST: GET /api/github/auth/github/callback`. You will then get a redirect to the frontend with an error (e.g. `no_code` or token exchange failure) because `code=test` is invalid. That is expected; the important part is that the **callback route ran**.

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

#### Issue: Callback never appears in server logs (backend not hit after GitHub redirect)
**Cause**: The browser is sent to a URL that does not reach your backend.

- **Check GitHub OAuth App “Authorization callback URL”**  
  It must be exactly: `http://localhost:6000/api/github/auth/github/callback` (no trailing slash, port 6000, backend path). If it is set to the frontend (e.g. `http://localhost:5173/...`), GitHub will redirect there and the backend will never see the request.

- **Check port**  
  When testing manually (browser or curl), use **port 6000** (backend), not 5173 (frontend). Example: `http://localhost:6000/api/github/auth/github/callback?...`

- **Check backend is running**  
  Ensure the API is running and listening on 6000. On startup you should see: `API running on http://0.0.0.0:6000` and the logged GitHub callback URL.

- **Confirm the request reaches Express**  
  Every request that hits the app is logged as: `INCOMING REQUEST: <method> <path>`. If you do not see `GET /api/github/auth/github/callback` when GitHub redirects (or when you open the callback URL manually), the request is not reaching the Node server (wrong host/port or something else handling the URL).

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