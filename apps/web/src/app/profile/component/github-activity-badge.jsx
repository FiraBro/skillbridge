// apps/web/src/app/profile/component/github-activity-badge.jsx
import { Badge } from "@/components/ui/badge";
import { FaCheckCircle, FaExclamationTriangle, FaClock } from "react-icons/fa";

export default function GitHubActivityBadge({ stats }) {
  if (!stats) return null;

  const getBadgeConfig = () => {
    if (stats.is_active && stats.commits_30d > 10) {
      return {
        icon: <FaCheckCircle className="w-3 h-3" />,
        text: "Highly Active",
        variant: "success",
        className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50",
      };
    }

    if (stats.is_active && stats.commits_30d > 0) {
      return {
        icon: <FaClock className="w-3 h-3" />,
        text: "Active",
        variant: "default",
        className: "bg-blue-500/20 text-blue-400 border-blue-500/50",
      };
    }

    return {
      icon: <FaExclamationTriangle className="w-3 h-3" />,
      text: "Inactive",
      variant: "secondary",
      className: "bg-slate-500/20 text-slate-400 border-slate-500/50",
    };
  };

  const config = getBadgeConfig();

  return (
    <Badge className={`flex items-center gap-1.5 ${config.className}`}>
      {config.icon}
      <span className="text-xs font-medium">{config.text}</span>
      {stats.commits_30d > 0 && (
        <span className="text-xs opacity-70">
          ({stats.commits_30d} commits/30d)
        </span>
      )}
    </Badge>
  );
}
