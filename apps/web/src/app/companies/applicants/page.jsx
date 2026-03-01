import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  FaUserCircle,
  FaStar,
  FaCheck,
  FaArrowLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useJobApplicants, useUpdateApplication } from "@/hooks/useJobs";

export default function ApplicantReview() {
  const { jobId } = useParams();
  const [selectedApp, setSelectedApp] = useState(null);

  const { data: applicantsResponse, isLoading } = useJobApplicants(jobId);
  const applicants = applicantsResponse?.data || [];
  const updateMutation = useUpdateApplication();

  const handleUpdateStatus = (appId, status, notes) => {
    updateMutation.mutate(
      { applicationId: appId, data: { status, notes } },
      {
        onSuccess: (res) => {
          setSelectedApp(res.data);
        },
      },
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-2 border-b pb-6">
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">
          Review Applicants
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage candidates for Job #{jobId}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Applicants List - Hidden on mobile if an applicant is selected */}
        <div
          className={`space-y-4 ${selectedApp ? "hidden lg:block" : "block"}`}
        >
          <h2 className="font-bold text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-4">
            <FaUserCircle className="text-primary" /> {applicants.length}{" "}
            Candidates
          </h2>

          <div className="space-y-2">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 bg-muted animate-pulse rounded-2xl"
                  />
                ))}
              </div>
            ) : (
              applicants.map((app) => (
                <Card
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`p-4 cursor-pointer transition-all border-2 active:scale-95 lg:active:scale-[0.98] ${
                    selectedApp?.id === app.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-transparent hover:border-muted-foreground/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border">
                      <AvatarImage src={app.developer?.avatar_url} />
                      <AvatarFallback className="font-bold">
                        {(app.developer?.name || "?")[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">
                        {app.developer?.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 uppercase"
                        >
                          {app.hiring_status}
                        </Badge>
                      </div>
                    </div>
                    <FaChevronRight className="text-muted-foreground/30 h-3 w-3 lg:hidden" />
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Applicant Detail View */}
        <div
          className={`lg:col-span-2 ${!selectedApp ? "hidden lg:block" : "block"}`}
        >
          <AnimatePresence mode="wait">
            {selectedApp ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="p-5 sm:p-8 space-y-8 relative overflow-hidden border-2 shadow-xl lg:shadow-none">
                  {/* Mobile Back Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden mb-4 -ml-2 text-muted-foreground"
                    onClick={() => setSelectedApp(null)}
                  >
                    <FaArrowLeft className="mr-2 h-3 w-3" /> Back to List
                  </Button>

                  <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                    <div className="flex gap-4 items-center">
                      <Avatar className="h-16 w-16 md:h-20 md:w-20 ring-4 ring-background shadow-lg">
                        <AvatarImage src={selectedApp.developer?.avatar_url} />
                        <AvatarFallback className="text-xl">
                          {(selectedApp.developer?.name || "?")[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-black">
                          {selectedApp.developer?.name}
                        </h2>
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                          <span className="flex items-center gap-1.5 text-sm font-bold bg-yellow-500/10 text-yellow-700 px-2 py-0.5 rounded-md">
                            <FaStar className="text-yellow-500" />{" "}
                            {selectedApp.developer?.reputation || 0}
                          </span>
                          <Link
                            to={`/profile/${selectedApp.developer?.username}`}
                          >
                            <Button
                              variant="link"
                              className="p-0 h-auto text-primary font-bold"
                            >
                              View Full Profile
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                    <Badge className="uppercase px-4 py-1 text-xs tracking-tighter rounded-full">
                      {selectedApp.hiring_status}
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs uppercase font-black text-muted-foreground tracking-[0.2em]">
                      Application Message
                    </h3>
                    <div className="relative">
                      <div className="absolute -left-2 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
                      <p className="text-sm md:text-base italic pl-4 text-foreground/80 leading-relaxed font-serif">
                        "{selectedApp.message || "No message provided."}"
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-8 border-t">
                    <h3 className="text-xs uppercase font-black text-muted-foreground tracking-[0.2em]">
                      Internal Management
                    </h3>
                    <Textarea
                      placeholder="Type private notes here... (only you can see these)"
                      className="min-h-[120px] rounded-2xl bg-muted/30 focus-visible:bg-background transition-colors"
                      value={selectedApp.private_notes || ""}
                      onChange={(e) =>
                        setSelectedApp({
                          ...selectedApp,
                          private_notes: e.target.value,
                        })
                      }
                    />
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="outline"
                        className="rounded-xl h-12 flex-1 font-bold"
                        onClick={() =>
                          handleUpdateStatus(
                            selectedApp.id,
                            "contacted",
                            selectedApp.private_notes,
                          )
                        }
                      >
                        Contact Candidate
                      </Button>
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700 rounded-xl h-12 flex-1 font-bold gap-2 shadow-lg shadow-emerald-600/20"
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
              </motion.div>
            ) : (
              <div className="hidden lg:flex h-[500px] border-2 border-dashed rounded-[2.5rem] flex-col items-center justify-center text-muted-foreground gap-4 bg-muted/5">
                <div className="p-4 bg-muted rounded-full">
                  <FaUserCircle className="h-8 w-8 opacity-20" />
                </div>
                <p className="font-medium">
                  Select a candidate from the left to begin review
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
