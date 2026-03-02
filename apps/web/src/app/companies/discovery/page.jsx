import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaSearch, FaFilter } from "react-icons/fa";

import useDebounce from "@/hooks/useDebounce";
import {
  useDevelopers,
  useBookmarks,
  useToggleBookmark,
} from "@/hooks/useTalentDiscovery";

import { Avatar } from "@/components/ui/avatar";
export default function TalentDiscovery() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [minRep, setMinRep] = useState(0);
  const [page, setPage] = useState(1);
  const [showFilter, setShowFilter] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  /* ================= DATA ================= */
  const { data: devRes, isLoading } = useDevelopers({
    search: debouncedSearch,
    minReputation: minRep,
    page,
    limit: 10,
  });

  const { data: bookmarkRes } = useBookmarks();
  const bookmarkMutation = useToggleBookmark();

  const { developers, totalPages } = useMemo(
    () => ({
      developers: devRes?.data?.data ?? [],
      totalPages: devRes?.data?.totalPages ?? 1,
    }),
    [devRes],
  );

  const bookmarks = useMemo(
    () => bookmarkRes?.data?.map((b) => b.id) ?? [],
    [bookmarkRes],
  );

  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#171717]">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3">
          <h1 className="font-bold text-lg tracking-tight">
            DEV<span className="text-blue-600">TALENT</span>
          </h1>

          {/* SEARCH + FILTER */}
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Input
                placeholder="Search developers, skills, or reputation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 pr-10"
              />
              <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <Button
              variant="outline"
              className="h-11 flex gap-2"
              onClick={() => setShowFilter((s) => !s)}
            >
              <FaFilter />
              Filter
            </Button>
          </div>

          {/* FILTER PANEL */}
          <AnimatePresence>
            {showFilter && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-gray-50 border rounded-lg p-4"
              >
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Minimum Reputation
                </label>

                <input
                  type="number"
                  value={minRep}
                  onChange={(e) => setMinRep(Number(e.target.value))}
                  className="mt-1 p-2 border rounded-md w-full md:w-48"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-40 bg-white border rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {developers.map((dev) => (
                <div
                  key={dev.id}
                  onClick={() => navigate(`/profile/${dev.username}`)}
                  className="w-full bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex gap-5">
                    {/* AVATAR */}
                    <Avatar name={dev.name} className="w-14 h-14 text-lg" />

                    {/* CONTENT */}
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold hover:text-blue-600 transition">
                        {dev.name}
                      </h2>

                      <p className="text-sm text-gray-500 mb-3">
                        @{dev.username}
                      </p>

                      {/* SKILLS */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {dev.skills?.map((skill) => (
                          <span
                            key={skill}
                            className="text-sm bg-gray-100 px-2 py-1 rounded-md"
                          >
                            #{skill}
                          </span>
                        ))}
                      </div>

                      {/* FOOTER */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm bg-gray-100 px-3 py-1 rounded-md">
                          ⭐ {dev.reputation_score} Reputation
                        </span>

                        <Button
                          variant="ghost"
                          size="sm"
                          className={
                            bookmarks.includes(dev.id)
                              ? "text-blue-600 bg-blue-50"
                              : ""
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            bookmarkMutation.mutate({
                              devId: dev.id,
                              isBookmarked: bookmarks.includes(dev.id),
                            });
                          }}
                        >
                          {bookmarks.includes(dev.id) ? "Saved" : "Save"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ================= PAGINATION ================= */}
        <div className="flex justify-center gap-4 pt-6">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Previous
          </Button>

          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </Button>
        </div>
      </main>
    </div>
  );
}
