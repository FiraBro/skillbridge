import React from 'react';
import { FaStar, FaCodeBranch, FaEye, FaExternalLinkAlt, FaLock, FaUnlock } from 'react-icons/fa';

const GitHubRepositories = ({ repositories = [], onTogglePin, onToggleHide }) => {
  if (!repositories || repositories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Repositories</h3>
        <p className="text-gray-600">No repositories found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Repositories</h3>
        <div className="space-y-4">
          {repositories.map((repo) => (
            <div 
              key={repo.name} 
              className={`border rounded-lg p-4 transition-all ${
                repo.is_hidden ? 'opacity-50 bg-gray-50' : 'hover:shadow-md'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <h4 className="font-semibold text-blue-600 hover:text-blue-800">
                      <a 
                        href={repo.html_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        {repo.name}
                        {repo.is_public ? <FaUnlock className="ml-2 text-xs text-gray-500" /> : <FaLock className="ml-2 text-xs text-gray-500" />}
                      </a>
                    </h4>
                    {repo.is_pinned && (
                      <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        Pinned
                      </span>
                    )}
                  </div>
                  {repo.description && (
                    <p className="text-gray-600 text-sm mt-1">{repo.description}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  {onTogglePin && (
                    <button
                      onClick={() => onTogglePin(repo.name, !repo.is_pinned)}
                      className={`p-1 rounded ${
                        repo.is_pinned 
                          ? 'text-yellow-500 bg-yellow-50' 
                          : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                      }`}
                      title={repo.is_pinned ? 'Unpin repository' : 'Pin repository'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 7L12 3L4 7L5 9C3.34315 10.3431 2.7778 12.7778 4 15C5.2222 17.2222 7.65685 18.7868 9 17L12 20L15 17C16.3431 18.7868 18.7778 17.2222 20 15C21.2222 12.7778 20.6569 10.3431 19 9L20 7Z"/>
                      </svg>
                    </button>
                  )}
                  {onToggleHide && (
                    <button
                      onClick={() => onToggleHide(repo.name, !repo.is_hidden)}
                      className={`p-1 rounded ${
                        repo.is_hidden 
                          ? 'text-red-500 bg-red-50' 
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                      }`}
                      title={repo.is_hidden ? 'Show repository' : 'Hide repository'}
                    >
                      {repo.is_hidden ? '👁️' : '🙈'}
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center mt-3 space-x-4 text-sm text-gray-600">
                {repo.language && (
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-1" 
                      style={{ backgroundColor: getLanguageColor(repo.language) }}
                    ></div>
                    {repo.language}
                  </div>
                )}
                <div className="flex items-center">
                  <FaStar className="mr-1" /> {repo.stars}
                </div>
                <div className="flex items-center">
                  <FaCodeBranch className="mr-1" /> {repo.forks}
                </div>
                <div className="text-xs">
                  Updated {new Date(repo.last_updated).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Simple language color mapping
const getLanguageColor = (language) => {
  const colors = {
    JavaScript: '#f1e05a',
    Python: '#3572A5',
    Java: '#b07219',
    TypeScript: '#2b7489',
    PHP: '#4F5D95',
    Ruby: '#701516',
    C: '#555555',
    'C++': '#f34b7d',
    'C#': '#178600',
    Shell: '#89e051',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Go: '#00ADD8',
    Rust: '#dea584',
    Swift: '#fa73fa',
    Kotlin: '#F18E33',
    Vue: '#41b883',
    React: '#61dafb',
    Angular: '#dd0031',
    Svelte: '#ff3e00',
  };
  
  return colors[language] || '#808080'; // Default gray
};

export default GitHubRepositories;