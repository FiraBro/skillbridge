import { Card } from "@/components/ui/card";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { FaGithub, FaStar, FaCodeBranch, FaHistory } from "react-icons/fa";

function CountUp({ value = 0 }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const animation = animate(count, value ?? 0, {
      duration: 1.5,
      ease: "easeOut",
    });
    return animation.stop;
  }, [value]);

  return <motion.span>{rounded}</motion.span>;
}

export default function GitHubStats({ stats }) {
  console.log("GitHubStats - stats:", stats);
  // ✅ Guard: no GitHub connected
  if (!stats || !stats.username) {
    return (
      <Card className="p-6 bg-slate-950 text-white border-slate-800">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
          <FaGithub /> GitHub Activity
        </h3>
        <p className="text-sm text-slate-400 italic">
          GitHub account not connected.
        </p>
      </Card>
    );
  }

  const { stars = 0, prs = 0, commits30d = 0, username } = stats;

  return (
    <Card className="p-6 bg-slate-950 text-white border-slate-800 overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <FaGithub size={80} />
      </div>

      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-6 flex items-center gap-2">
        <FaGithub /> GitHub Activity
      </h3>

      <div className="grid grid-cols-1 gap-4">
        <StatRow
          icon={<FaStar className="text-yellow-500" />}
          label="Stars"
          value={stars}
        />
        <StatRow
          icon={<FaCodeBranch className="text-blue-500" />}
          label="PRs Merged"
          value={prs}
        />
        <StatRow
          icon={<FaHistory className="text-emerald-500" />}
          label="Commits (30d)"
          value={commits30d}
        />
      </div>

      <a
        href={`https://github.com/${username}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 block text-center py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm font-medium"
      >
        github.com/{username}
      </a>
    </Card>
  );
}

function StatRow({ icon, label, value }) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm text-slate-400">{label}</span>
      </div>
      <span className="text-lg font-mono font-bold">
        <CountUp value={value} />
      </span>
    </div>
  );
}
