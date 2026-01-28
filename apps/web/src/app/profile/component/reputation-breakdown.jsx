// apps/web/src/app/profile/component/reputation-breakdown.jsx
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  FaCode,
  FaGithub,
  FaFire,
  FaFileAlt,
  FaHeart,
  FaRocket,
  FaStar,
  FaClock,
} from "react-icons/fa";

export default function ReputationBreakdown({ breakdown }) {
  if (!breakdown) return null;

  const sources = [
    {
      icon: <FaCode className="text-blue-500" />,
      label: "Skills",
      score: breakdown.breakdown.skills,
      count: breakdown.counts.skills,
      color: "bg-blue-500",
    },
    {
      icon: <FaGithub className="text-purple-500" />,
      label: "GitHub",
      score: breakdown.breakdown.github,
      count: `${breakdown.counts.repos} repos`,
      color: "bg-purple-500",
    },
    {
      icon: <FaFire className="text-orange-500" />,
      label: "Activity",
      score: breakdown.breakdown.activity,
      count: `${breakdown.counts.commits30d} commits/30d`,
      color: "bg-orange-500",
    },
    {
      icon: <FaFileAlt className="text-green-500" />,
      label: "Posts",
      score: breakdown.breakdown.posts,
      count: breakdown.counts.posts,
      color: "bg-green-500",
    },
    {
      icon: <FaHeart className="text-pink-500" />,
      label: "Engagement",
      score: breakdown.breakdown.engagement,
      count: `${breakdown.counts.likes} likes`,
      color: "bg-pink-500",
    },
    {
      icon: <FaRocket className="text-cyan-500" />,
      label: "Projects",
      score: breakdown.breakdown.projects,
      count: breakdown.counts.projects,
      color: "bg-cyan-500",
    },
    {
      icon: <FaStar className="text-yellow-500" />,
      label: "Endorsements",
      score: breakdown.breakdown.endorsements,
      count: breakdown.counts.endorsements,
      color: "bg-yellow-500",
    },
    {
      icon: <FaClock className="text-slate-500" />,
      label: "Longevity",
      score: breakdown.breakdown.longevity,
      count: "Account age",
      color: "bg-slate-500",
    },
  ];

  const maxScore = Math.max(...sources.map((s) => s.score));

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">Reputation Breakdown</h3>
          <div className="text-right">
            <div className="text-2xl font-black">{breakdown.total}</div>
            <div className="text-xs text-muted-foreground">Total Score</div>
          </div>
        </div>

        <div className="space-y-3">
          {sources.map((source, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  {source.icon}
                  <span className="font-medium">{source.label}</span>
                  <span className="text-xs text-muted-foreground">
                    ({source.count})
                  </span>
                </div>
                <span className="font-bold">{source.score}</span>
              </div>
              <Progress
                value={(source.score / maxScore) * 100}
                className="h-2"
                indicatorClassName={source.color}
              />
            </div>
          ))}
        </div>

        <div className="pt-4 border-t text-xs text-muted-foreground">
          <p>
            Reputation is calculated from your contributions across the
            platform. Keep contributing to increase your score!
          </p>
        </div>
      </div>
    </Card>
  );
}
