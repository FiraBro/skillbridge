import AdvancedContributionInsights from './AdvancedContributionInsights';

// Simple wrapper to maintain compatibility with existing code
const ContributionInsights = ({ githubData }) => {
  return <AdvancedContributionInsights githubData={githubData} />;
};

export default ContributionInsights;