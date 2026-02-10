import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  FaUserCircle,
  FaStar,
  FaCheck,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { useJobApplicants, useUpdateApplication } from "@/hooks/useJobs";

export default function ApplicantReview() {
  const { jobId } = useParams();
  const [selectedApp, setSelectedApp] = useState(null);

  const { data: applicantsResponse, isLoading } = useJobApplicants(jobId);
  console.log("Applicants Data for Job ID", jobId, ":", applicantsResponse);
  const applicants = applicantsResponse?.data || [];
  const updateMutation = useUpdateApplication();

  const handleUpdateStatus = (appId, status, notes) => {
    updateMutation.mutate(
      { applicationId: appId, data: { status, notes } },
      {
        onSuccess: (res) => {
          // Update the detail view with the newly returned data
          // The backend now returns the nested developer object
          setSelectedApp(res.data);
        },
      },
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Header section... (stays same) */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Applicants List */}
        <div className="space-y-4">
          <h2 className="font-bold flex items-center gap-2">
            <FaUserCircle className="text-primary" /> All Applicants
          </h2>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            applicants.map((app) => (
              <Card
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className={`p-4 cursor-pointer transition-all ${
                  selectedApp?.id === app.id
                    ? "ring-2 ring-primary border-primary"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={app.developer?.avatar_url} />
                    <AvatarFallback>
                      {(app.developer?.name || "?")[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold truncate">
                      {app.developer?.name}
                    </h4>
                    <p className="text-xs uppercase text-muted-foreground">
                      {app.hiring_status}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Applicant Detail View */}
        <div className="lg:col-span-2">
          {selectedApp ? (
            <Card className="p-4 sm:p-8 space-y-8">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={selectedApp.developer?.avatar_url} />
                    <AvatarFallback>
                      {(selectedApp.developer?.name || "?")[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-black">
                      {selectedApp.developer?.name}
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-sm font-bold">
                        <FaStar className="text-yellow-500" />{" "}
                        {selectedApp.developer?.reputation || 0}
                      </span>
                      <Link to={`/profile/${selectedApp.developer?.username}`}>
                        <Button variant="link" className="p-0 h-auto">
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
                <Badge className="uppercase">{selectedApp.hiring_status}</Badge>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold border-b pb-2">Application Message</h3>
                <p className="text-sm italic p-4 bg-muted rounded-xl leading-relaxed">
                  "{selectedApp.message || "No message provided."}"
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-bold">Internal Management</h3>
                <Textarea
                  placeholder="Private notes..."
                  value={selectedApp.private_notes || ""}
                  onChange={(e) =>
                    setSelectedApp({
                      ...selectedApp,
                      private_notes: e.target.value,
                    })
                  }
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleUpdateStatus(
                        selectedApp.id,
                        "contacted",
                        selectedApp.private_notes,
                      )
                    }
                  >
                    Contacted
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700 gap-2"
                    onClick={() =>
                      handleUpdateStatus(
                        selectedApp.id,
                        "hired",
                        selectedApp.private_notes,
                      )
                    }
                  >
                    <FaCheck /> Mark as Hired
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <div className="h-64 border-2 border-dashed rounded-3xl flex items-center justify-center text-muted-foreground">
              Select an applicant to review
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
