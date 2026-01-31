import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import GitHubProfileCard from './GitHubProfileCard';
import GitHubRepositories from './GitHubRepositories';
import ContributionInsights from './ContributionInsights';
import GitHubConnectButton from './GitHubConnectButton';
import { toast } from 'react-toastify';

const GitHubProfileSection = ({ isOwnProfile = false }) => {
  const { username } = useParams();
  const [githubData, setGithubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    fetchGitHubData();
  }, [username]);

  const fetchGitHubData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/github/profile/${username}`);
      setGithubData(response.data);
      setIsConnected(!!response.data.github?.stats);
    } catch (error) {
      console.error('Error fetching GitHub data:', error);
      toast.error('Failed to load GitHub profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePinnedRepos = async (repoName, shouldBePinned) => {
    try {
      const pinnedRepos = githubData.github.repositories
        .filter(repo => (repo.name === repoName ? shouldBePinned : repo.is_pinned))
        .map(repo => repo.name);
      
      await axios.patch(`${process.env.REACT_APP_API_URL}/api/github/pinned-repos`, {
        pinnedRepos
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      // Update local state
      setGithubData(prev => ({
        ...prev,
        github: {
          ...prev.github,
          repositories: prev.github.repositories.map(repo =>
            repo.name === repoName ? { ...repo, is_pinned: shouldBePinned } : repo
          )
        }
      }));
      
      toast.success(`Repository ${shouldBePinned ? 'pinned' : 'unpinned'} successfully`);
    } catch (error) {
      console.error('Error updating pinned repos:', error);
      toast.error(`Failed to ${shouldBePinned ? 'pin' : 'unpin'} repository`);
    }
  };

  const handleUpdateHiddenRepos = async (repoName, shouldBeHidden) => {
    try {
      const hiddenRepos = githubData.github.repositories
        .filter(repo => (repo.name === repoName ? shouldBeHidden : repo.is_hidden))
        .map(repo => repo.name);
      
      await axios.patch(`${process.env.REACT_APP_API_URL}/api/github/hidden-repos`, {
        hiddenRepos
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      // Update local state
      setGithubData(prev => ({
        ...prev,
        github: {
          ...prev.github,
          repositories: prev.github.repositories.map(repo =>
            repo.name === repoName ? { ...repo, is_hidden: shouldBeHidden } : repo
          )
        }
      }));
      
      toast.success(`Repository ${shouldBeHidden ? 'hidden' : 'shown'} successfully`);
    } catch (error) {
      console.error('Error updating hidden repos:', error);
      toast.error(`Failed to ${shouldBeHidden ? 'hide' : 'show'} repository`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!githubData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">GitHub Profile</h3>
        <p className="text-gray-600">GitHub profile data not available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* GitHub Profile Card */}
      <GitHubProfileCard githubData={githubData.github} />

      {/* Action Buttons (only for own profile) */}
      {isOwnProfile && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">GitHub Integration</h3>
            <GitHubConnectButton 
              isConnected={isConnected} 
              onSync={fetchGitHubData}
              username={username}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Connect your GitHub account to showcase your development activity and projects to potential clients.
          </p>
        </div>
      )}

      {/* Contribution Insights */}
      <ContributionInsights githubData={githubData.github} />

      {/* Repositories */}
      <GitHubRepositories 
        repositories={githubData.github.repositories}
        onTogglePin={isOwnProfile ? handleUpdatePinnedRepos : null}
        onToggleHide={isOwnProfile ? handleUpdateHiddenRepos : null}
      />
    </div>
  );
};

export default GitHubProfileSection;