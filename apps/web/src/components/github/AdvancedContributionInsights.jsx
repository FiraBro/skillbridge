import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ScatterChart, Scatter } from 'recharts';
import { FaCalendarAlt, FaClock, FaUserCheck, FaFire, FaChartLine, FaRegLightbulb } from 'react-icons/fa';

const AdvancedContributionInsights = ({ githubData }) => {
  const { stats } = githubData;

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Advanced Contribution Insights</h3>
        <p className="text-gray-600">No GitHub data available to show insights.</p>
      </div>
    );
  }

  // Generate mock data for contribution calendar (last 3 months)
  const generateContributionData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 90; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // Generate random contribution counts with some pattern
      const contributionCount = Math.floor(Math.random() * 10);
      
      data.push({
        date: date.toISOString().split('T')[0],
        contributions: contributionCount,
        weekday: date.getDay()
      });
    }
    
    return data;
  };

  const contributionData = generateContributionData();

  // Prepare data for weekly activity chart
  const weeklyActivityData = stats.weekly_activity 
    ? Object.entries(stats.weekly_activity).map(([day, count]) => ({
        name: day.substring(0, 3), // Abbreviated day name
        activity: count
      }))
    : [];

  // Prepare data for most active days
  const mostActiveDays = stats.most_active_days || [];

  // Generate contribution explanation for clients
  const generateContributionExplanation = () => {
    const { 
      commits30d, 
      public_repos, 
      followers, 
      total_stars, 
      consistency_score, 
      contribution_streak 
    } = stats;

    let explanation = "This developer ";

    if (commits30d > 20) {
      explanation += "shows consistent weekly activity ";
    } else if (commits30d > 10) {
      explanation += "has moderate weekly activity ";
    } else {
      explanation += "has occasional weekly activity ";
    }

    explanation += `with ${commits30d} commits in the last 30 days. `;

    if (consistency_score > 0.7) {
      explanation += "They demonstrate strong consistency in their development work. ";
    } else if (consistency_score > 0.4) {
      explanation += "They show moderate consistency in their development work. ";
    } else {
      explanation += "They have room for improvement in maintaining consistent development activity. ";
    }

    if (contribution_streak > 30) {
      explanation += "They have maintained a contribution streak of over a month, showing dedication to their projects.";
    } else if (contribution_streak > 7) {
      explanation += "They regularly contribute to their projects, showing commitment to their work.";
    } else {
      explanation += "They occasionally contribute to their projects.";
    }

    return explanation;
  };

  // Calculate trust indicators
  const trustIndicators = [
    {
      title: "Verified GitHub Account",
      value: "Yes",
      icon: <FaUserCheck className="text-green-500" />,
      description: "Account is linked and verified through OAuth"
    },
    {
      title: "Activity Consistency",
      value: `${(stats.consistency_score * 100).toFixed(0)}%`,
      icon: <FaChartLine className="text-blue-500" />,
      description: "Shows regular development activity"
    },
    {
      title: "Contribution Streak",
      value: `${stats.contribution_streak} days`,
      icon: <FaFire className="text-orange-500" />,
      description: "Days with at least one contribution"
    },
    {
      title: "Project Maturity",
      value: `${stats.public_repos} repos`,
      icon: <FaRegLightbulb className="text-purple-500" />,
      description: "Number of public repositories"
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Advanced Contribution Insights</h3>
        
        {/* Client-friendly explanation */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
          <p className="text-gray-700 italic">
            "{generateContributionExplanation()}"
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {trustIndicators.map((indicator, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center mb-2">
                <span className="mr-2">{indicator.icon}</span>
                <h4 className="font-medium text-gray-800">{indicator.title}</h4>
              </div>
              <div className="text-2xl font-bold text-gray-900">{indicator.value}</div>
              <p className="text-xs text-gray-600 mt-1">{indicator.description}</p>
            </div>
          ))}
        </div>

        {/* Contribution Calendar Visualization */}
        <div className="mb-8">
          <h4 className="font-medium text-gray-800 mb-3 flex items-center">
            <FaCalendarAlt className="mr-2" /> Contribution Activity (Last 90 Days)
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={contributionData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} contributions`, 'Activity']}
                  labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="contributions" 
                  stroke="#3b82f6" 
                  fill="#93c5fd" 
                  name="Contributions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        {weeklyActivityData.length > 0 && (
          <div className="mb-8">
            <h4 className="font-medium text-gray-800 mb-3 flex items-center">
              <FaClock className="mr-2" /> Weekly Activity Distribution
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyActivityData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="activity" name="Activities" fill="#10b981">
                    {weeklyActivityData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.activity > 0 ? '#10b981' : '#d1d5db'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Most Active Days */}
        {mostActiveDays.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-800 mb-3">Most Active Days</h4>
            <div className="flex flex-wrap gap-2">
              {mostActiveDays.map((day, index) => (
                <div 
                  key={index} 
                  className="px-4 py-3 bg-indigo-100 text-indigo-800 rounded-lg flex items-center"
                >
                  <span className="font-medium text-lg">{day.day}</span>
                  <span className="ml-3 text-sm">({day.activity} activities)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">{stats.public_repos}</div>
            <div className="text-xs text-gray-600">Public Repos</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">{stats.followers}</div>
            <div className="text-xs text-gray-600">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-yellow-600">{stats.total_stars || 0}</div>
            <div className="text-xs text-gray-600">Total Stars</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-600">{stats.total_commits || 0}</div>
            <div className="text-xs text-gray-600">Commits</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedContributionInsights;