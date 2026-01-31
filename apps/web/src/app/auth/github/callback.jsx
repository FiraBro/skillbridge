import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const GitHubCallbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const state = params.get('state');
      const error = params.get('error');
      const errorDescription = params.get('error_description');

      if (error) {
        console.error('GitHub OAuth error:', error, errorDescription);
        // Send error to parent window
        window.opener.postMessage({
          type: 'GITHUB_OAUTH_ERROR',
          error: `${error}: ${errorDescription}`
        }, window.location.origin);
        return;
      }

      if (code && state) {
        try {
          // Send success message to parent window
          window.opener.postMessage({
            type: 'GITHUB_OAUTH_SUCCESS',
            payload: { code, state }
          }, window.location.origin);
        } catch (err) {
          console.error('Error posting message to parent:', err);
        }
      } else {
        window.opener.postMessage({
          type: 'GITHUB_OAUTH_ERROR',
          error: 'Missing code or state in callback'
        }, window.location.origin);
      }

      // Close the popup window after a short delay
      setTimeout(() => {
        window.close();
      }, 1000);
    };

    handleCallback();
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800">Completing GitHub Authentication...</h2>
        <p className="text-gray-600 mt-2">Please wait while we process your request.</p>
      </div>
    </div>
  );
};

export default GitHubCallbackPage;