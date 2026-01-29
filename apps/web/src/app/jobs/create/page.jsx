import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FaTrash, FaRocket, FaLightbulb, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

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
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black flex items-center gap-2">
          <FaRocket className="text-primary" />
          Post a Problem
        </h1>
        <p className="text-muted-foreground">
          Focus on outcomes and challenges, not requirements.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-8 space-y-6">
          <Input
            placeholder="Clear title"
            value={job.title}
            onChange={(e) => setJob({ ...job, title: e.target.value })}
            required
          />

          <Textarea
            placeholder="Describe the challenge"
            className="h-32"
            value={job.description}
            onChange={(e) => setJob({ ...job, description: e.target.value })}
            required
          />

          <Textarea
            placeholder="Expected outcome"
            className="h-24"
            value={job.expectedOutcome}
            onChange={(e) =>
              setJob({ ...job, expectedOutcome: e.target.value })
            }
            required
          />

          <Input
            placeholder="Budget range"
            value={job.budgetRange}
            onChange={(e) => setJob({ ...job, budgetRange: e.target.value })}
          />

          {/* Trial-friendly */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() =>
              setJob((prev) => ({
                ...prev,
                trialFriendly: !prev.trialFriendly,
              }))
            }
          >
            <div
              className={`w-5 h-5 border rounded ${
                job.trialFriendly
                  ? "bg-primary border-primary"
                  : "border-border"
              }`}
            >
              {job.trialFriendly && (
                <FaCheckCircle className="text-white text-xs" />
              )}
            </div>
            <span className="text-sm">Trial-friendly</span>
          </div>

          {/* Skills */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Add skill"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addSkill())
                }
              />
              <Button type="button" onClick={addSkill}>
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((skill) => (
                <Badge key={skill} className="gap-2">
                  {skill}
                  <FaTrash
                    className="cursor-pointer"
                    onClick={() => removeSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-lg"
            disabled={createJobMutation.isPending}
          >
            {createJobMutation.isPending
              ? "Publishing..."
              : "Publish Opportunity"}
          </Button>
        </Card>
      </form>
    </div>
  );
}
