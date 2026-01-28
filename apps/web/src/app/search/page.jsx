import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FaSearch,
  FaUser,
  FaBriefcase,
  FaFilter,
  FaArrowRight,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import DeveloperCard from "../companies/components/developer-card";
import JobCard from "../jobs/components/job-card";

export default function GlobalSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState({ developers: [], jobs: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (query) {
      handleSearch();
    }
  }, [query]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.data);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-10 space-y-8">
      <div className="flex flex-col gap-6">
        <h1 className="text-4xl font-black tracking-tight">
          Search SkillBridge
        </h1>

        <div className="flex gap-2 max-w-2xl">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-12 h-14 text-lg bg-card/50"
              placeholder="Search developers, skills, or opportunities..."
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
            onClick={handleSearch}
          >
            Search
          </Button>
        </div>

        <div className="flex gap-4 border-b">
          {["all", "developers", "jobs"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-4 text-sm font-bold capitalize transition-all relative ${
                activeTab === tab
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <FaFilter className="text-primary" /> Filters
            </h3>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">
                Min Reputation
              </label>
              <Input
                type="number"
                placeholder="0"
                className="bg-background/50"
              />
            </div>
          </Card>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-3 space-y-8">
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
                {/* Developers Results */}
                {(activeTab === "all" || activeTab === "developers") &&
                  results.developers.length > 0 && (
                    <section className="space-y-4">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <FaUser className="text-primary" /> Developers (
                        {results.developers.length})
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.developers.map((dev) => (
                          <DeveloperCard key={dev.id} developer={dev} />
                        ))}
                      </div>
                    </section>
                  )}

                {/* Jobs Results */}
                {(activeTab === "all" || activeTab === "jobs") &&
                  results.jobs.length > 0 && (
                    <section className="space-y-4">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <FaBriefcase className="text-primary" /> Opportunities (
                        {results.jobs.length})
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.jobs.map((job) => (
                          <JobCard key={job.id} job={job} />
                        ))}
                      </div>
                    </section>
                  )}

                {query &&
                  results.developers.length === 0 &&
                  results.jobs.length === 0 && (
                    <div className="text-center py-20 bg-muted/20 rounded-3xl">
                      <p className="text-muted-foreground text-lg">
                        No results found for "{query}"
                      </p>
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
