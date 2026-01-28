import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  FaUserCircle,
  FaStar,
  FaSave,
  FaCheck,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { useToast } from "@/components/ui/use-toast";

export default function ApplicantReview() {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const fetchApplicants = async () => {
    try {
      // In a real app, this would be a specific endpoint for job applicants
      const res = await fetch(`/api/jobs/${jobId}`);
      const data = await res.json();
      // For MVP, we'll assume applications are nested or fetched separately
      // Mocking for now as the specialized applicant fetcher isn't in job service yet
      setApplicants([]);
    } catch (error) {
      console.error("Failed to fetch applicants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, status, notes) => {
    try {
      const res = await fetch(`/api/companies/applications/${appId}/feedback`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });
      if (res.ok) {
        toast({
          title: "Updated",
          description: "Hiring status saved internally.",
        });
      }
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            Review Applicants
          </h1>
          <p className="text-muted-foreground">
            Screen talent using verified SkillBridge profiles.
          </p>
        </div>
        <Link to="/company-dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Applicants List */}
        <div className="space-y-4">
          <h2 className="font-bold flex items-center gap-2">
            <FaUserCircle className="text-primary" /> All Applicants
          </h2>
          {loading ? (
            <div className="space-y-3 opacity-50">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-muted animate-pulse rounded-xl"
                />
              ))}
            </div>
          ) : applicants.length === 0 ? (
            <div className="p-10 text-center border-2 border-dashed rounded-2xl text-muted-foreground">
              No applications yet.
            </div>
          ) : (
            applicants.map((app) => (
              <Card
                key={app.id}
                className={`p-4 cursor-pointer transition-all hover:border-primary/50 ${selectedApp?.id === app.id ? "ring-2 ring-primary border-primary" : ""}`}
                onClick={() => setSelectedApp(app)}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={app.avatar_url} />
                    <AvatarFallback>{app.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold truncate">{app.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {app.reputation} Rep • {app.status}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Selected Applicant View */}
        <div className="lg:col-span-2">
          {selectedApp ? (
            <Card className="p-8 space-y-8 bg-card/50 backdrop-blur-sm">
              <div className="flex justify-between items-start">
                <div className="flex gap-6">
                  <Avatar className="h-20 w-20 ring-4 ring-primary/10">
                    <AvatarImage src={selectedApp.avatar_url} />
                    <AvatarFallback>{selectedApp.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-3xl font-black">{selectedApp.name}</h2>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-sm font-bold">
                        <FaStar className="text-yellow-500" />{" "}
                        {selectedApp.reputation} Reputation
                      </div>
                      <Link to={`/profile/${selectedApp.profile_id}`}>
                        <Button
                          variant="link"
                          className="h-auto p-0 text-primary gap-1"
                        >
                          View Full Profile{" "}
                          <FaExternalLinkAlt className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
                <Badge className="px-3 py-1 uppercase text-[10px]">
                  {selectedApp.hiring_status}
                </Badge>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold border-b pb-2">Application Message</h3>
                <p className="text-sm text-foreground/80 italic leading-relaxed bg-background/50 p-4 rounded-xl">
                  "{selectedApp.message || "No message provided."}"
                </p>
              </div>

              <div className="space-y-6 pt-6 border-t">
                <h3 className="font-bold">Internal Management</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">
                      Private Notes (Company Only)
                    </label>
                    <Textarea
                      placeholder="e.g. Strong Rust skills, good communication during initial chat..."
                      className="bg-background/80"
                      value={selectedApp.private_notes || ""}
                      onChange={(e) =>
                        setSelectedApp({
                          ...selectedApp,
                          private_notes: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() =>
                        handleUpdateStatus(
                          selectedApp.id,
                          "contacted",
                          selectedApp.private_notes,
                        )
                      }
                      variant="outline"
                      className="gap-2"
                    >
                      Contacted
                    </Button>
                    <Button
                      onClick={() =>
                        handleUpdateStatus(
                          selectedApp.id,
                          "trial_started",
                          selectedApp.private_notes,
                        )
                      }
                      variant="outline"
                      className="gap-2"
                    >
                      Start Trial
                    </Button>
                    <Button
                      onClick={() =>
                        handleUpdateStatus(
                          selectedApp.id,
                          "hired",
                          selectedApp.private_notes,
                        )
                      }
                      className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <FaCheck /> Mark as Hired
                    </Button>
                    <Button
                      onClick={() =>
                        handleUpdateStatus(
                          selectedApp.id,
                          "rejected",
                          selectedApp.private_notes,
                        )
                      }
                      variant="ghost"
                      className="text-red-500 hover:text-red-600"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-20 bg-muted/10 rounded-3xl border-2 border-dashed">
              <FaUserCircle className="text-6xl text-muted-foreground/20 mb-4" />
              <h3 className="text-xl font-bold text-muted-foreground">
                Select an applicant to review
              </h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                View their verified SkillBridge profile and manage the hiring
                flow.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
