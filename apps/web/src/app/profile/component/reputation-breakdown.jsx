import { Progress } from "@/components/ui/progress";
import {
  Code2,
  Github,
  Zap,
  FileText,
  Heart,
  Rocket,
  Award,
  Clock,
} from "lucide-react";

export default function ReputationBreakdown({ total, breakdown }) {
  if (!breakdown) return null;

  const sources = [
    {
      icon: Code2,
      label: "Profile Skills",
      value: breakdown.skills,
      color: "text-blue-500",
      bg: "bg-blue-500",
    },
    {
      icon: Github,
      label: "GitHub Auth",
      value: breakdown.github,
      color: "text-purple-500",
      bg: "bg-purple-500",
    },
    {
      icon: Zap,
      label: "30d Momentum",
      value: breakdown.activity,
      color: "text-orange-500",
      bg: "bg-orange-500",
    },
    {
      icon: FileText,
      label: "Insights",
      value: breakdown.posts,
      color: "text-emerald-500",
      bg: "bg-emerald-500",
    },
    {
      icon: Heart,
      label: "Social Trust",
      value: breakdown.engagement,
      color: "text-pink-500",
      bg: "bg-pink-500",
    },
    {
      icon: Rocket,
      label: "Ship Credits",
      value: breakdown.projects,
      color: "text-cyan-500",
      bg: "bg-cyan-500",
    },
    {
      icon: Award,
      label: "Endorsements",
      value: breakdown.endorsements,
      color: "text-yellow-500",
      bg: "bg-yellow-500",
    },
    {
      icon: Clock,
      label: "Platform Age",
      value: breakdown.longevity,
      color: "text-slate-500",
      bg: "bg-slate-500",
    },
  ];

  const maxScore = Math.max(...sources.map((s) => s.value), 1);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">
            Aggregate Trust Score
          </p>
          <div className="flex items-center gap-3">
            <h2 className="text-5xl font-black italic tracking-tighter">
              {total}
            </h2>
            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wide mb-2">
              Verified
            </span>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs font-medium text-muted-foreground">
            Top 2% of contributors
          </p>
          <div className="flex gap-1 mt-1 justify-end">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-1 w-4 rounded-full bg-primary" />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        {sources.map((source, index) => (
          <div key={index} className="space-y-2 group">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <source.icon
                  className={`h-4 w-4 ${source.color} transition-transform group-hover:scale-110`}
                />
                <span className="font-bold uppercase tracking-tight text-foreground/80">
                  {source.label}
                </span>
              </div>
              <span className="font-mono font-bold text-muted-foreground">
                {source.value} pts
              </span>
            </div>
            <div className="relative h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={`absolute h-full ${source.bg} rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${(source.value / maxScore) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
