import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Added for smoothness
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FaSearch,
  FaUsers,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

import useDebounce from "@/hooks/useDebounce";
import {
  useDevelopers,
  useBookmarks,
  useToggleBookmark,
} from "@/hooks/useTalentDiscovery";
import { useAuth } from "@/hooks/useAuth";
import DeveloperListItem from "../components/developer-card";

export default function TalentDiscovery() {
  const { user } = useAuth();
  const isCompany = user?.role === "company";

  const [search, setSearch] = useState("");
  const [minRep, setMinRep] = useState(0);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 500);

  // 1. Fetching Data
  const {
    data: devRes,
    isLoading,
    isFetching,
  } = useDevelopers({
    search: debouncedSearch,
    minReputation: minRep,
    page,
    limit: 9,
  });

  const { data: bookmarkRes } = useBookmarks();
  const bookmarkMutation = useToggleBookmark();

  const developers =
    devRes?.data?.data?.filter((u) => u.role === "developer") ?? [];
  const totalPages = devRes?.data?.totalPages ?? 1;
  const bookmarks = bookmarkRes?.data?.map((b) => b.id) ?? [];

  // Reset page if filters reduce total pages
  useEffect(() => {
    if (page > totalPages && totalPages > 0) setPage(1);
  }, [totalPages, page]);

  // Smooth scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  if (!isCompany) {
    return (
      <div className="max-w-3xl mx-auto py-32 text-center">
        <h2 className="text-2xl font-bold mb-3">
          Talent Discovery is for Companies
        </h2>
        <p className="text-muted-foreground">
          Only company accounts can browse and bookmark developers.
        </p>
      </div>
    );
  }

  const handleBookmark = (devId) => {
    bookmarkMutation.mutate({
      devId,
      isBookmarked: bookmarks.includes(devId),
    });
  };

  // Framer Motion Variants
  const containerVars = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const itemVars = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10 min-h-screen">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="pt-6 pb-2 space-y-2"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
          Discover Top Developers
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Browse vetted talent based on reputation, skills, and verified
          contribution history.
        </p>
      </motion.div>

      {/* Filters Section */}
      <div className="bg-card border rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-center sticky top-4 z-10 shadow-sm backdrop-blur-md bg-card/90">
        <div className="relative flex-1 w-full">
          <FaSearch
            className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isFetching ? "text-primary animate-pulse" : "text-muted-foreground"}`}
          />
          <Input
            className="pl-10 focus-visible:ring-primary"
            placeholder="Search by name, skills, or bio..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            Min Rep:
          </span>
          <Input
            type="number"
            className="w-full md:w-24"
            value={minRep}
            onChange={(e) => {
              setMinRep(Number(e.target.value));
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Developer List - Fixed height container to prevent layout shifts */}
      <div className="min-h-[600px] relative">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 rounded-2xl bg-muted animate-pulse border"
                />
              ))}
            </motion.div>
          ) : developers.length > 0 ? (
            <motion.div
              key="results"
              variants={containerVars}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              {developers.map((dev) => (
                <motion.div key={dev.id} variants={itemVars}>
                  <DeveloperListItem
                    developer={dev}
                    isBookmarked={bookmarks.includes(dev.id)}
                    onBookmark={() => handleBookmark(dev.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 bg-muted/30 rounded-3xl border border-dashed"
            >
              <p className="text-lg text-muted-foreground">
                No developers match your criteria.
              </p>
              <Button
                variant="link"
                onClick={() => {
                  setSearch("");
                  setMinRep(0);
                }}
              >
                Clear filters
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {developers.length > 0 && (
        <div className="flex justify-center items-center gap-6 pt-6 border-t">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            disabled={page === 1 || isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <FaChevronLeft />
          </Button>

          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">{page}</span>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium text-muted-foreground">
              {totalPages}
            </span>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            disabled={page === totalPages || isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            <FaChevronRight />
          </Button>
        </div>
      )}
    </div>
  );
}
