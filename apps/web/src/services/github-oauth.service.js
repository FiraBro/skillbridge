// GitHub OAuth Service using popup window approach
export class GitHubOAuthService {
  constructor() {
    this.clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || 'Iv23liVM04FbFaYYRTGS'; // Use your client ID
    this.apiBaseUrl = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:6000';
  }

  async initiateOAuth() {
    return new Promise((resolve, reject) => {
      // Create a popup window for GitHub OAuth
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const state = btoa(JSON.stringify({
        timestamp: Date.now(),
        nonce: Math.random().toString(36).substring(2, 15)
      }));
      
      const redirectUri = `${window.location.origin}/github-callback`;
      const githubAuthUrl = `https://github.com/login/oauth/authorize?` +
        `client_id=${this.clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=read:user%20repo&` +
        `state=${encodeURIComponent(state)}`;
      
      // Open popup window
      const popup = window.open(
        githubAuthUrl,
        'github_oauth',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );
      
      if (!popup) {
        reject(new Error('Popup blocked. Please allow popups for this site.'));
        return;
      }
      
      // Listen for messages from the popup
      const handleMessage = (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GITHUB_OAUTH_SUCCESS') {
          window.removeEventListener('message', handleMessage);
          popup.close();
          resolve(event.data.payload);
        } else if (event.data.type === 'GITHUB_OAUTH_ERROR') {
          window.removeEventListener('message', handleMessage);
          popup.close();
          reject(new Error(event.data.error));
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      // Timeout after 5 minutes
      setTimeout(() => {
        window.removeEventListener('message', handleMessage);
        if (!popup.closed) {
          popup.close();
        }
        reject(new Error('OAuth timeout. Please try again.'));
      }, 5 * 60 * 1000); // 5 minutes
    });
  }
  
  async exchangeCodeForToken(code) {
    try {
      // First, we need to get an auth token from the main app
      // This assumes the user is already logged in to your app
      const response = await fetch(`${this.apiBaseUrl}/api/github/exchange-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming JWT token is stored
        },
        body: JSON.stringify({ code }),
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to exchange code for token');
      }

      return await response.json();
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  }
}

export const githubOAuthService = new GitHubOAuthService();