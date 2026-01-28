// apps/web/src/app/profile/component/reputation-history.jsx
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FaArrowUp,
  FaArrowDown,
  FaFileAlt,
  FaHeart,
  FaRocket,
  FaStar,
  FaGithub,
  FaSync,
} from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

export default function ReputationHistory({ history }) {
  if (!history || history.length === 0) {
    return (
      <Card className="p-6 bg-card/50 backdrop-blur-sm">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">No reputation history yet</p>
        </div>
      </Card>
    );
  }

  const getReasonIcon = (reason) => {
    const icons = {
      post_created: <FaFileAlt className="text-green-500" />,
      post_liked: <FaHeart className="text-pink-500" />,
      project_added: <FaRocket className="text-cyan-500" />,
      endorsement_received: <FaStar className="text-yellow-500" />,
      github_sync: <FaGithub className="text-purple-500" />,
      recalculation: <FaSync className="text-slate-500" />,
    };
    return icons[reason] || <FaSync className="text-slate-500" />;
  };

  const getReasonLabel = (reason) => {
    const labels = {
      post_created: "Post Created",
      post_liked: "Post Liked",
      project_added: "Project Added",
      endorsement_received: "Endorsement Received",
      github_sync: "GitHub Sync",
      recalculation: "Recalculation",
    };
    return labels[reason] || reason;
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm">
      <h3 className="text-lg font-bold mb-4">Reputation History</h3>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/50"
          >
            <div className="mt-0.5">{getReasonIcon(entry.reason)}</div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">
                  {getReasonLabel(entry.reason)}
                </span>
                <Badge
                  variant={entry.change_amount > 0 ? "default" : "secondary"}
                  className="text-xs"
                >
                  {entry.change_amount > 0 ? (
                    <FaArrowUp className="w-3 h-3 mr-1 inline" />
                  ) : (
                    <FaArrowDown className="w-3 h-3 mr-1 inline" />
                  )}
                  {Math.abs(entry.change_amount)}
                </Badge>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  {entry.previous_score} → {entry.new_score}
                </span>
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(entry.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
