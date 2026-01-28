// apps/web/src/app/profile/component/github-verification-badge.jsx
import { Badge } from "@/components/ui/badge";
import { FaShieldAlt, FaGithub } from "react-icons/fa";

/**
 * Displays a verification badge showing GitHub account authenticity
 * Based on account age and activity patterns
 */
export default function GitHubVerificationBadge({ stats }) {
  if (!stats || !stats.account_created) return null;

  const accountAge = getAccountAgeInDays(stats.account_created);
  const isVerified = accountAge > 365 && stats.public_repos > 5;
  const isTrusted =
    accountAge > 730 && stats.public_repos > 10 && stats.commits_30d > 5;

  if (isTrusted) {
    return (
      <Badge className="flex items-center gap-1.5 bg-purple-500/20 text-purple-400 border-purple-500/50">
        <FaShieldAlt className="w-3 h-3" />
        <span className="text-xs font-medium">Trusted Developer</span>
      </Badge>
    );
  }

  if (isVerified) {
    return (
      <Badge className="flex items-center gap-1.5 bg-blue-500/20 text-blue-400 border-blue-500/50">
        <FaGithub className="w-3 h-3" />
        <span className="text-xs font-medium">Verified Account</span>
      </Badge>
    );
  }

  return (
    <Badge className="flex items-center gap-1.5 bg-slate-500/20 text-slate-400 border-slate-500/50">
      <FaGithub className="w-3 h-3" />
      <span className="text-xs font-medium">New Account</span>
    </Badge>
  );
}

function getAccountAgeInDays(createdAt) {
  if (!createdAt) return 0;
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
