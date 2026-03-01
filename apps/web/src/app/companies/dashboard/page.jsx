import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FaPlus,
  FaRocket,
  FaUsers,
  FaArrowRight,
  FaBriefcase,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { useCompanyJobs } from "@/hooks/useJobs";

export default function CompanyDashboard() {
  const { data, isLoading, isError } = useCompanyJobs();
  const jobs = data?.data || [];

  if (isLoading) return <DashboardSkeleton />;

  if (isError) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-10 text-center">
        <div className="p-8 bg-red-50 rounded-3xl border border-red-100">
          <p className="text-red-600 font-bold">
            Failed to load dashboard data.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 lg:p-12 space-y-8 md:space-y-12">
      {/* Header - Stacked on mobile, row on desktop */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900">
            Company Dashboard
          </h1>
          <p className="text-muted-foreground text-sm md:text-base font-medium">
            Manage your hiring pipeline and active opportunities.
          </p>
        </div>

        <Link to="/jobs/create" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto gap-2 h-12 px-6 rounded-xl shadow-lg shadow-primary/20 transition-transform active:scale-95">
            <FaPlus />
            Post a Problem
          </Button>
        </Link>
      </div>

      {/* Stats Grid - 1 col on mobile, 3 on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCard
          icon={<FaRocket className="text-primary" />}
          label="Active Posts"
          value={jobs.length}
          bgColor="bg-primary/5"
          borderColor="border-primary/10"
        />
        <StatCard
          icon={<FaUsers className="text-blue-500" />}
          label="Total Applicants"
          value={jobs.reduce(
            (s, j) => s + (parseInt(j.applicant_count || 0) || 0),
            0,
          )}
          bgColor="bg-blue-500/5"
          borderColor="border-blue-500/10"
        />
        <StatCard
          icon={<FaBriefcase className="text-purple-500" />}
          label="Hired"
          value={jobs.reduce(
            (s, j) => s + (parseInt(j.hired_count || 0) || 0),
            0,
          )}
          bgColor="bg-purple-500/5"
          borderColor="border-purple-500/10"
          className="sm:col-span-2 lg:col-span-1" // Makes it full width on tablet but 1/3 on desktop
        />
      </div>

      {/* Jobs Section */}
      <section className="space-y-6">
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          Your Open Opportunities
          <Badge variant="secondary" className="rounded-full">
            {jobs.length}
          </Badge>
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-shadow border-gray-200/60 rounded-2xl">
                <div className="space-y-2 w-full md:w-auto">
                  <h4 className="font-bold text-lg md:text-xl text-gray-900 leading-tight">
                    {job.title}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-white font-semibold">
                      {job.budget_range}
                    </Badge>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold uppercase text-[10px]">
                      {job.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-none pt-4 md:pt-0">
                  <Link
                    to={`/applicants/${job.id}`}
                    className="flex-1 md:flex-none"
                  >
                    <Button
                      variant="outline"
                      className="w-full rounded-xl font-bold h-11 border-2"
                    >
                      Manage Applicants
                    </Button>
                  </Link>

                  <Link to={`/jobs/${job.id}`}>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-xl h-11 w-11 shrink-0"
                    >
                      <FaArrowRight />
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}

          {jobs.length === 0 && (
            <div className="text-center py-16 md:py-24 border-2 border-dashed border-gray-200 rounded-[2rem] bg-gray-50/50">
              <div className="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto shadow-sm mb-4">
                <FaBriefcase className="text-gray-300 text-2xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                No opportunities yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Start your hiring process by posting your first problem.
              </p>
              <Link to="/jobs/create">
                <Button variant="outline" className="rounded-full px-8">
                  Create Job Post
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// Sub-component for Stats to keep code clean
function StatCard({
  icon,
  label,
  value,
  bgColor,
  borderColor,
  className = "",
}) {
  return (
    <Card
      className={`p-6 ${bgColor} ${borderColor} border-2 rounded-2xl shadow-sm ${className}`}
    >
      <h3 className="font-bold text-sm md:text-base flex items-center gap-2 text-gray-700">
        {icon}
        {label}
      </h3>
      <p className="text-3xl md:text-4xl font-black mt-2 text-gray-900">
        {value}
      </p>
    </Card>
  );
}

// Loading Skeleton
function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64 bg-gray-200 rounded-lg" />
          <Skeleton className="h-4 w-48 bg-gray-100 rounded-lg" />
        </div>
        <Skeleton className="h-12 w-40 bg-gray-200 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 bg-gray-100 rounded-2xl" />
        ))}
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full bg-gray-50 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
