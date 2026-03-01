import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaSlidersH,
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

  const [search, setSearch] = useState("");
  const [minRep, setMinRep] = useState(0);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 500);

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

  useEffect(() => {
    if (page > totalPages && totalPages > 0) setPage(1);
  }, [totalPages, page]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const handleBookmark = (devId) => {
    bookmarkMutation.mutate({
      devId,
      isBookmarked: bookmarks.includes(devId),
    });
  };

  const containerVars = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const itemVars = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12 space-y-6 md:space-y-12 min-h-screen">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3 text-center md:text-left"
      >
        <h1 className="text-3xl md:text-6xl font-black tracking-tighter text-foreground">
          Discover Talent
        </h1>
        <p className="text-sm md:text-xl text-muted-foreground max-w-2xl leading-relaxed mx-auto md:mx-0">
          Connect with vetted developers based on verifiable reputation scores
          and open-source contribution history.
        </p>
      </motion.div>

      {/* Filter Bar - Optimized for Mobile Sticky */}
      <div className="sticky top-4 md:top-20 z-30 bg-background/80 backdrop-blur-xl border border-border/50 rounded-3xl p-2 md:p-4 shadow-2xl flex flex-col md:flex-row gap-2 md:gap-4 items-stretch transition-all">
        <div className="relative flex-1 group">
          <FaSearch
            className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${
              isFetching
                ? "text-primary scale-110"
                : "text-muted-foreground group-focus-within:text-primary"
            }`}
          />
          <Input
            className="pl-12 h-12 md:h-14 rounded-2xl border-none bg-muted/40 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:bg-background text-base"
            placeholder="Search by tech stack or name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-2 bg-muted/40 p-1 md:p-1.5 rounded-2xl md:min-w-[200px]">
          <div className="flex items-center gap-2 pl-3">
            <FaSlidersH className="text-primary h-4 w-4" />
            <span className="hidden md:inline text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Min Rep
            </span>
          </div>
          <Input
            type="number"
            className="h-10 md:h-11 w-full md:w-24 rounded-xl border-none bg-background font-bold text-center"
            value={minRep}
            onChange={(e) => {
              setMinRep(Number(e.target.value));
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Developer Grid */}
      <div className="min-h-[500px] relative">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8"
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-64 rounded-[2rem] bg-muted/50 animate-pulse border border-border/50"
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8"
            >
              {developers.map((dev) => (
                <motion.div key={dev.id} variants={itemVars} className="h-full">
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-32 bg-muted/10 rounded-[3rem] border-4 border-dashed border-muted flex flex-col items-center justify-center gap-6 px-8"
            >
              <div className="p-6 bg-muted rounded-full">
                <FaSearch className="h-10 w-10 text-muted-foreground opacity-20" />
              </div>
              <div className="space-y-1">
                <p className="text-xl font-bold text-foreground">
                  No matches found
                </p>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or lowering the reputation
                  filter.
                </p>
              </div>
              <Button
                variant="outline"
                className="rounded-full px-10 h-12 font-bold border-2"
                onClick={() => {
                  setSearch("");
                  setMinRep(0);
                }}
              >
                Clear All Filters
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination Container */}
      {developers.length > 0 && (
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 py-10 border-t border-border/50">
          <div className="text-sm font-medium text-muted-foreground order-2 md:order-1">
            Page{" "}
            <span className="text-foreground font-black px-2 py-1 bg-muted rounded-md">
              {page}
            </span>{" "}
            of {totalPages}
          </div>

          <div className="flex items-center gap-3 order-1 md:order-2 w-full md:w-auto">
            <Button
              variant="secondary"
              size="lg"
              className="flex-1 md:flex-none rounded-2xl h-14 px-8 font-bold active:scale-95 transition-transform"
              disabled={page === 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <FaChevronLeft className="mr-2 h-3 w-3" /> Prev
            </Button>

            <Button
              variant="secondary"
              size="lg"
              className="flex-1 md:flex-none rounded-2xl h-14 px-8 font-bold active:scale-95 transition-transform"
              disabled={page === totalPages || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <FaChevronRight className="ml-2 h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
