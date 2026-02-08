// apps/web/src/app/profile/components/reputation-bar.jsx
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { HiOutlineStar, HiOutlineInformationCircle } from "react-icons/hi2";

export default function ReputationBar({ reputation }) {
  // Convert 5-point scale to percentage for the progress bar
  const percentage = (reputation.score / 5) * 100;
  if (reputation.count === 0) {
    return (
      <div className="p-6 rounded-2xl border border-dashed border-primary/20 bg-primary/5 flex flex-col items-center text-center space-y-3">
        <div className="p-3 rounded-full bg-primary/10">
          <HiOutlineStar className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-sm">No reviews yet</h4>
          <p className="text-xs text-muted-foreground">
            Be the first to verify this developer's skills.
          </p>
        </div>
        <button className="text-xs font-bold text-primary hover:underline">
          Leave a Review
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl border bg-card/50 backdrop-blur-sm shadow-sm space-y-4">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-tighter text-muted-foreground">
              Platform Reputation
            </h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HiOutlineInformationCircle className="h-3.5 w-3.5 text-muted-foreground/50" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px] text-xs">
                  Reputation is calculated based on code reviews, successful
                  project handovers, and community contributions.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black tracking-tighter">
              {reputation.score.toFixed(1)}
            </span>
            <div className="flex text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <HiOutlineStar
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(reputation.score) ? "fill-current" : "text-muted"}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-muted-foreground">
            {reputation.count} verified reviews
          </p>
        </div>
      </div>

      <div className="relative">
        {/* The Progress Bar with a custom gradient and shimmer */}
        <Progress
          value={percentage}
          className="h-3 bg-secondary overflow-hidden"
        />

        {/* Framer Motion Shimmer Overlay */}
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
        />
      </div>

      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
        <span>Junior</span>
        <span>Mid-Level</span>
        <span>Expert</span>
        <span>Top 1%</span>
      </div>
    </div>
  );
}
