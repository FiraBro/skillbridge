import React, { useEffect } from 'react';
import { useState } from 'react';
import { FaGithub, FaSync, FaTimesCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { githubOAuthService } from '../../services/github-oauth.service';

const GitHubConnectButton = ({ isConnected, onConnect, onDisconnect, onSync, username }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check for success/error messages in URL when component mounts
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    const errorDetails = urlParams.get('details');

    if (success === 'github_connected') {
      toast.success('GitHub account connected successfully!');
      // Remove the success parameter from URL without reloading
      urlParams.delete('success');
      const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
      window.history.replaceState({}, document.title, newUrl);
    } else if (error) {
      if (errorDetails) {
        toast.error(`GitHub connection error: ${decodeURIComponent(errorDetails)}`);
      } else {
        toast.error(`GitHub connection error: ${error}`);
      }
      // Remove the error parameters from URL without reloading
      urlParams.delete('error');
      urlParams.delete('details');
      const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  const handleConnect = async () => {
    if (loading) return;

    setLoading(true);
    try {
      // Use the popup-based OAuth flow
      const result = await githubOAuthService.initiateOAuth();

      // Exchange the code for tokens on the backend
      await githubOAuthService.exchangeCodeForToken(result.code);

      toast.success('GitHub account connected successfully!');
      navigate(0); // Refresh the page to update the UI
    } catch (error) {
      console.error('Error connecting to GitHub:', error);
      toast.error(error.message || 'Failed to connect to GitHub. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/github/disconnect`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      toast.success('GitHub account disconnected successfully');
      if (onDisconnect) onDisconnect();
    } catch (error) {
      console.error('Error disconnecting from GitHub:', error);
      toast.error('Failed to disconnect from GitHub. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/github/sync`, {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      toast.success('GitHub data synced successfully');
      if (onSync) onSync();
    } catch (error) {
      console.error('Error syncing GitHub data:', error);
      toast.error('Failed to sync GitHub data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isConnected) {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleSync}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <FaSync className="mr-2" />
          )}
          Sync Data
        </button>
        
        <button
          onClick={handleDisconnect}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          <FaTimesCircle className="mr-2" />
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 transition-colors"
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <FaGithub className="mr-2" />
      )}
      Connect GitHub
    </button>
  );
};

export default GitHubConnectButton;