import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FaSearch, FaUser, FaBriefcase, FaFilter } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import DeveloperCard from "../companies/components/developer-card";
import JobCard from "../jobs/components/job-card";

// ✅ hooks you already have
import { useDeveloperDiscovery } from "@/hooks/useDeveloper";
import { useJobs } from "@/hooks/useJobs";

export default function GlobalSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() || "";
  const [activeTab, setActiveTab] = useState("all");

  const isQueryValid = query.length >= 2;

  // ✅ Developers
  const { developers = [], isLoading: devLoading } = useDeveloperDiscovery(
    isQueryValid ? { search: query } : { search: "" },
  );

  // ✅ Jobs
  const { data: jobs = [], isLoading: jobLoading } = useJobs(
    isQueryValid ? { search: query } : null,
  );

  const loading = devLoading || jobLoading;

  const hasResults = developers.length > 0 || jobs.length > 0;

  return (
    <div className="container max-w-6xl mx-auto px-4 py-10 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col gap-6">
        <h1 className="text-4xl font-black tracking-tight">
          Search SkillBridge
        </h1>

        {/* SEARCH INPUT */}
        <div className="flex gap-2 max-w-2xl">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-12 h-14 text-lg bg-card/50"
              placeholder="Search developers or opportunities..."
              defaultValue={query}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearchParams({ q: e.target.value });
                }
              }}
            />
          </div>
          <Button
            className="h-14 px-8 text-lg font-bold"
            onClick={() => setSearchParams({ q: query })}
          >
            Search
          </Button>
        </div>

        {/* TABS */}
        <div className="flex gap-4 border-b">
          {["all", "developers", "jobs"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-4 text-sm font-bold capitalize relative ${
                activeTab === tab ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-primary"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* FILTERS */}
        <div>
          <Card className="p-6 space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <FaFilter /> Filters
            </h3>
            <Input type="number" placeholder="Min reputation" />
          </Card>
        </div>

        {/* RESULTS */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="space-y-6 opacity-50">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-48 bg-muted animate-pulse rounded-2xl"
                />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-12"
              >
                {/* DEVELOPERS */}
                {(activeTab === "all" || activeTab === "developers") &&
                  developers.length > 0 && (
                    <section className="space-y-4">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <FaUser /> Developers ({developers.length})
                      </h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {developers.map((dev) => (
                          <DeveloperCard key={dev.id} developer={dev} />
                        ))}
                      </div>
                    </section>
                  )}

                {/* JOBS */}
                {(activeTab === "all" || activeTab === "jobs") &&
                  jobs.length > 0 && (
                    <section className="space-y-4">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <FaBriefcase /> Opportunities ({jobs.length})
                      </h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {jobs.map((job) => (
                          <JobCard key={job.id} job={job} />
                        ))}
                      </div>
                    </section>
                  )}

                {/* NO RESULTS */}
                {query && !hasResults && (
                  <div className="text-center py-20 bg-muted/20 rounded-3xl">
                    No results found for “{query}”
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
