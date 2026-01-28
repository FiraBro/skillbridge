import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  FaPlus,
  FaTrash,
  FaRocket,
  FaLightbulb,
  FaCheckCircle,
} from "react-icons/fa";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export default function CreateJob() {
  const [job, setJob] = useState({
    title: "",
    description: "",
    budgetRange: "",
    requiredSkills: [],
    expectedOutcome: "",
    trialFriendly: false,
  });
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const addSkill = () => {
    if (skillInput && !job.required_skills.includes(skillInput)) {
      setJob({ ...job, requiredSkills: [...job.requiredSkills, skillInput] });
      setSkillInput("");
    }
  };

  const removeSkill = (skill) => {
    setJob({
      ...job,
      requiredSkills: job.requiredSkills.filter((s) => s !== skill),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(job),
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Job Posted!",
          description: "Your opportunity is now live.",
        });
        navigate("/company-dashboard");
      }
    } catch (error) {
      console.error("Post failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
          <FaRocket className="text-primary" />
          Post a Problem
        </h1>
        <p className="text-muted-foreground">
          Focus on outcomes and challenges, not just lists of requirements.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Clear Title</label>
            <Input
              placeholder="e.g. Build an Open Source Reputation Engine"
              value={job.title}
              onChange={(e) => setJob({ ...job, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              The Problem / Challenge
            </label>
            <Textarea
              placeholder="Describe the technical hurdle you want to solve..."
              className="h-32"
              value={job.description}
              onChange={(e) => setJob({ ...job, description: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <FaLightbulb className="text-yellow-500" /> Expected Outcome
            </label>
            <Textarea
              placeholder="What does success look like? (e.g. A library that exports X, Y, Z)"
              className="h-24"
              value={job.expectedOutcome}
              onChange={(e) =>
                setJob({ ...job, expectedOutcome: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Budget Range</label>
              <Input
                placeholder="e.g. $2k - $5k"
                value={job.budgetRange}
                onChange={(e) =>
                  setJob({ ...job, budgetRange: e.target.value })
                }
              />
            </div>
            <div className="space-y-2 flex flex-col justify-end">
              <div
                className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg cursor-pointer select-none"
                onClick={() =>
                  setJob({ ...job, trialFriendly: !job.trialFriendly })
                }
              >
                <div
                  className={`w-5 h-5 rounded border ${job.trialFriendly ? "bg-primary border-primary" : "bg-background border-border"} flex items-center justify-center transition-colors`}
                >
                  {job.trialFriendly && (
                    <FaCheckCircle className="text-white text-xs" />
                  )}
                </div>
                <span className="text-sm font-medium">
                  Trial-friendly (Open to small paid tests)
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium">Required Skills</label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Rust, PostgreSQL"
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
              {job.requiredSkills.map((skill, index) => (
                <Badge key={index} className="gap-2 pl-3">
                  {skill}
                  <FaTrash
                    className="w-2 h-2 cursor-pointer hover:text-red-400"
                    onClick={() => removeSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-lg font-bold"
            disabled={loading}
          >
            {loading ? "Publishing..." : "Publish Opportunity"}
          </Button>
        </Card>
      </form>
    </div>
  );
}
