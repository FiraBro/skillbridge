import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FaBriefcase,
  FaDollarSign,
  FaBolt,
  FaCheckCircle,
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function JobCard({ job, onApply }) {
  const isHighMatch = job.matchPercentage >= 70;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors relative overflow-hidden group">
        {/* Match Percentage Indicator */}
        {job.matchPercentage !== undefined && (
          <div
            className={`absolute top-0 right-0 px-4 py-1 text-xs font-bold rounded-bl-lg ${
              isHighMatch
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <div className="flex items-center gap-1">
              <FaBolt className={isHighMatch ? "animate-pulse" : ""} />
              {job.matchPercentage}% Match
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
              {job.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FaBriefcase className="text-primary/70" />
              <span>{job.client_name}</span>
              <span>•</span>
              <FaDollarSign className="text-green-500/70" />
              <span>{job.budget_range}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {job.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {job.required_skills?.map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-primary/5 text-primary-foreground/80 border-primary/10"
              >
                {skill}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">
              Posted {new Date(job.created_at).toLocaleDateString()}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/jobs/${job.id}`, "_self")}
              >
                View Details
              </Button>
              <Button
                size="sm"
                onClick={() => onApply?.(job)}
                disabled={job.application_status}
              >
                {job.application_status ? (
                  <span className="flex items-center gap-1">
                    <FaCheckCircle /> Applied
                  </span>
                ) : (
                  "Apply with Profile"
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
