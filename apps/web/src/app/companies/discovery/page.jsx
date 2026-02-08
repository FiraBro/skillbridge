import { useState, useEffect } from "react";
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

  // Only companies can access discovery
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

  // Developers query
  const { data: devRes, isLoading } = useDevelopers({
    search: debouncedSearch,
    minReputation: minRep,
    page,
    limit: 9,
  });
  console.log("Developer Discovery Response:", devRes);

  const { data: bookmarkRes } = useBookmarks();
  const bookmarkMutation = useToggleBookmark();
  console.log("Bookmarks:", bookmarkRes);
  const developers =
    devRes?.data.data.filter((u) => u.role === "developer") ?? [];
  const totalPages = devRes?.data.totalPages ?? 1;
  const bookmarks = bookmarkRes?.data.map((b) => b.id) ?? [];

  // Reset page if filters reduce total pages
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const handleBookmark = (devId) => {
    bookmarkMutation.mutate({
      devId,
      isBookmarked: bookmarks.includes(devId),
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/10 to-background rounded-3xl p-8 flex flex-col gap-3">
        <h1 className="text-4xl font-black flex items-center gap-3">
          <FaUsers className="text-primary" />
          Discover Top Developers
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Browse vetted developers based on reputation, skills, and real
          contribution history.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search by name, skills, or bio..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <Input
          type="number"
          placeholder="Min Reputation"
          className="w-full md:w-40"
          value={minRep}
          onChange={(e) => {
            setMinRep(Number(e.target.value));
            setPage(1);
          }}
        />
      </div>

      {/* Developer List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : developers.length > 0 ? (
        <div className="space-y-4">
          {developers.map((dev) => (
            <DeveloperListItem
              key={dev.id}
              developer={dev}
              isBookmarked={bookmarks.includes(dev.id)}
              onBookmark={() => handleBookmark(dev.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-muted/30 rounded-3xl">
          <p className="text-lg text-muted-foreground">
            No developers match your criteria.
          </p>
        </div>
      )}

      {/* Pagination */}
      {developers.length > 0 && (
        <div className="flex justify-center items-center gap-6 pt-6">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <FaChevronLeft />
          </Button>

          <span className="font-medium">
            Page {page} of {totalPages}
          </span>

          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <FaChevronRight />
          </Button>
        </div>
      )}
    </div>
  );
}
