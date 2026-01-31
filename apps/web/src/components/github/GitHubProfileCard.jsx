import React from 'react';
import { FaGithub, FaStar, FaCodeBranch, FaEye, FaCalendarAlt, FaUsers, FaUserFriends } from 'react-icons/fa';

const GitHubProfileCard = ({ githubData }) => {
  const { stats } = githubData;

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">GitHub Profile</h3>
          <span className="text-sm text-gray-500">Not connected</span>
        </div>
        <p className="text-gray-600">This developer hasn't connected their GitHub account yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white">
        <div className="flex items-center space-x-4">
          <img 
            src={stats.github_avatar || stats.avatarUrl} 
            alt="GitHub Avatar" 
            className="w-16 h-16 rounded-full border-2 border-white"
          />
          <div>
            <h3 className="text-xl font-bold flex items-center">
              <FaGithub className="mr-2" />
              {stats.github_username}
            </h3>
            <p className="text-gray-300">{stats.github_bio}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.public_repos}</div>
            <div className="text-sm text-gray-600">Public Repos</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.followers}</div>
            <div className="text-sm text-gray-600">Followers</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.total_stars || 0}</div>
            <div className="text-sm text-gray-600">Total Stars</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.total_commits || 0}</div>
            <div className="text-sm text-gray-600">Commits</div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Account Age</span>
            <span className="font-medium">{stats.account_age_months} months</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Contribution Streak</span>
            <span className="font-medium">{stats.contribution_streak} days</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Consistency Score</span>
            <span className="font-medium">{(stats.consistency_score * 100).toFixed(0)}%</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-gray-600">Last Activity</span>
            <span className="font-medium">
              {stats.last_activity ? new Date(stats.last_activity).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>

        {/* Top Languages */}
        {stats.top_languages && stats.top_languages.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold text-gray-800 mb-2">Top Languages</h4>
            <div className="flex flex-wrap gap-2">
              {stats.top_languages.slice(0, 5).map((lang, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHubProfileCard;