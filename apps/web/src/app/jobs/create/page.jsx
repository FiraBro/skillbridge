import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  FaTrash,
  FaRocket,
  FaLightbulb,
  FaCheckCircle,
  FaPlus,
  FaInfoCircle,
} from "react-icons/fa";

import { useCreateJob } from "@/hooks/useJobs";

export default function CreateJob() {
  const navigate = useNavigate();
  const createJobMutation = useCreateJob(navigate);

  const [job, setJob] = useState({
    title: "",
    description: "",
    budgetRange: "",
    requiredSkills: [],
    expectedOutcome: "",
    trialFriendly: false,
  });

  const [skillInput, setSkillInput] = useState("");

  const addSkill = () => {
    if (!skillInput.trim()) return;
    if (job.requiredSkills.includes(skillInput)) return;

    setJob((prev) => ({
      ...prev,
      requiredSkills: [...prev.requiredSkills, skillInput],
    }));
    setSkillInput("");
  };

  const removeSkill = (skill) => {
    setJob((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((s) => s !== skill),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createJobMutation.mutate(job);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 lg:p-12 space-y-8 md:space-y-12 min-h-screen">
      {/* Header Section */}
      <div className="space-y-3 text-center md:text-left">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold mx-auto md:mx-0"
        >
          <FaRocket /> <span>New Opportunity</span>
        </motion.div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight">
          Post a Problem
        </h1>
        <p className="text-muted-foreground text-sm md:text-lg max-w-2xl">
          Focus on outcomes and technical challenges, not just a list of
          requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Form Area */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 order-1">
          <Card className="p-5 md:p-10 space-y-6 md:space-y-8 shadow-xl border-t-4 border-t-primary rounded-[2rem]">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                Opportunity Title
              </label>
              <Input
                placeholder="e.g., Scale our real-time notification engine"
                className="h-12 md:h-14 text-base md:text-lg rounded-xl bg-muted/30 border-none focus-visible:ring-2"
                value={job.title}
                onChange={(e) => setJob({ ...job, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                The Challenge
              </label>
              <Textarea
                placeholder="What is the core problem you need solved?"
                className="min-h-[150px] md:min-h-[200px] text-base rounded-xl bg-muted/30 border-none focus-visible:ring-2 p-4"
                value={job.description}
                onChange={(e) =>
                  setJob({ ...job, description: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Budget Range
                </label>
                <Input
                  placeholder="e.g., $2k - $5k"
                  className="h-12 rounded-xl bg-muted/30 border-none"
                  value={job.budgetRange}
                  onChange={(e) =>
                    setJob({ ...job, budgetRange: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                  Expected Outcome
                </label>
                <Input
                  placeholder="e.g., 99.9% Delivery Rate"
                  className="h-12 rounded-xl bg-muted/30 border-none"
                  value={job.expectedOutcome}
                  onChange={(e) =>
                    setJob({ ...job, expectedOutcome: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Trial-friendly Toggle - Optimized for touch */}
            <div
              className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                job.trialFriendly
                  ? "border-primary bg-primary/5"
                  : "border-muted bg-transparent"
              }`}
              onClick={() =>
                setJob((prev) => ({
                  ...prev,
                  trialFriendly: !prev.trialFriendly,
                }))
              }
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${job.trialFriendly ? "bg-primary" : "bg-muted"}`}
                >
                  {job.trialFriendly && (
                    <FaCheckCircle className="text-white text-sm" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-sm">Trial-friendly</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">
                    Allows paid test tasks first
                  </p>
                </div>
              </div>
            </div>

            {/* Skills Input */}
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                Key Technologies
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add technology..."
                  className="h-12 rounded-xl bg-muted/30 border-none"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addSkill())
                  }
                />
                <Button
                  type="button"
                  onClick={addSkill}
                  className="h-12 w-12 rounded-xl"
                  size="icon"
                >
                  <FaPlus />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill) => (
                  <Badge
                    key={skill}
                    className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary border-none flex items-center gap-2 hover:bg-destructive/10 hover:text-destructive transition-colors group"
                  >
                    {skill}
                    <FaTrash
                      className="cursor-pointer text-[10px] opacity-50 group-hover:opacity-100"
                      onClick={() => removeSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-black rounded-2xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
              disabled={createJobMutation.isPending}
            >
              {createJobMutation.isPending
                ? "Publishing..."
                : "Publish Opportunity"}
            </Button>
          </Card>
        </form>

        {/* Sidebar Info - Stacks below form on mobile */}
        <div className="lg:col-span-4 space-y-6 order-2">
          <Card className="p-6 bg-muted/20 border-none rounded-3xl">
            <h3 className="font-black text-sm flex items-center gap-2 mb-4">
              <FaLightbulb className="text-yellow-500" /> Posting Tips
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm leading-relaxed">
                <div className="h-5 w-5 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0 text-[10px]">
                  1
                </div>
                <p>
                  <strong>Be Specific:</strong> Mention the scale of the problem
                  (e.g., 100k users).
                </p>
              </li>
              <li className="flex gap-3 text-sm leading-relaxed">
                <div className="h-5 w-5 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0 text-[10px]">
                  2
                </div>
                <p>
                  <strong>Focus on Goals:</strong> Tell the developer what
                  success looks like, not how to code it.
                </p>
              </li>
            </ul>
          </Card>

          <div className="p-6 border-2 border-dashed border-muted rounded-3xl flex items-start gap-3">
            <FaInfoCircle className="text-muted-foreground mt-1 shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed uppercase font-bold tracking-tight">
              Submitting this post will notify developers with matching
              reputation scores.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
