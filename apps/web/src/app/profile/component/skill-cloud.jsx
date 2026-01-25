// apps/web/src/app/profile/components/skills-cloud.jsx
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.4 },
  },
};

const item = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1 },
};

export default function SkillsCloud({ skills }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        Core Stack & Expertise
      </h3>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-wrap gap-2"
      >
        {skills.map((skill) => (
          <motion.div
            key={skill.id}
            variants={item}
            whileHover={{ scale: 1.05, filter: "brightness(1.1)" }}
            className="cursor-default"
          >
            <Badge
              variant="secondary"
              className="px-3 py-1.5 rounded-lg border-primary/10 bg-secondary/30 hover:bg-secondary transition-all"
            >
              {skill.name}
              <span className="ml-2 text-[10px] opacity-50 font-mono">
                {skill.projects}px
              </span>
            </Badge>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
