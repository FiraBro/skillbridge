import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FaPlus, FaRocket, FaUsers, FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";

import { useCompanyJobs } from "@/hooks/useJobs";

export default function CompanyDashboard() {
  const { data, isLoading, isError } = useCompanyJobs();

  const jobs = data?.data || [];

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <p className="text-muted-foreground">Loading dashboard…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <p className="text-red-500 font-bold">Failed to load jobs</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            Company Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your hiring pipeline and job opportunities.
          </p>
        </div>

        <Link to="/jobs/create">
          <Button className="gap-2">
            <FaPlus />
            Post a Problem
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-primary/5 border-primary/10">
          <h3 className="font-bold flex items-center gap-2">
            <FaRocket className="text-primary" />
            Active Posts
          </h3>
          <p className="text-3xl font-black mt-2">{jobs.length}</p>
        </Card>

        <Card className="p-6 bg-blue-500/5 border-blue-500/10">
          <h3 className="font-bold flex items-center gap-2">
            <FaUsers className="text-blue-500" />
            Total Applicants
          </h3>
          <p className="text-3xl font-black mt-2">
            {jobs.reduce(
              (s, j) => s + (parseInt(j.applicant_count || 0) || 0),
              0,
            )}
          </p>
        </Card>

        <Card className="p-6 bg-purple-500/5 border-purple-500/10">
          <h3 className="font-bold flex items-center gap-2">
            <FaUsers className="text-purple-500" />
            Hired
          </h3>
          <p className="text-3xl font-black mt-2">
            {jobs.reduce((s, j) => s + (parseInt(j.hired_count || 0) || 0), 0)}
          </p>
        </Card>
      </div>

      {/* Jobs */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Your Open Opportunities</h2>

        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => (
            <Card
              key={job.id}
              className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-1">
                <h4 className="font-bold text-lg">{job.title}</h4>
                <div className="flex gap-2">
                  <Badge variant="outline">{job.budget_range}</Badge>
                  <Badge variant="secondary">{job.status}</Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Link to={`/applicants/${job.id}`}>
                  <Button variant="outline" size="sm">
                    Manage Applicants
                  </Button>
                </Link>

                <Link to={`/jobs/${job.id}`}>
                  <Button size="sm" variant="ghost">
                    <FaArrowRight />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}

          {jobs.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed rounded-xl">
              <p className="text-muted-foreground">
                You haven't posted any jobs yet.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
