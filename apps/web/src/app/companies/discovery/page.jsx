import { useState, useEffect } from "react";
import DeveloperCard from "./components/developer-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaSearch, FaFilter, FaUsers } from "react-icons/fa";

export default function TalentDiscovery() {
  const [developers, setDevelopers] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [minRep, setMinRep] = useState(0);

  useEffect(() => {
    fetchDevelopers();
    fetchBookmarks();
  }, []);

  const fetchDevelopers = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/companies/discovery?search=${search}&minReputation=${minRep}`,
      );
      const data = await res.json();
      if (data.success) {
        setDevelopers(data.data);
      }
    } catch (error) {
      console.error("Discovery failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const res = await fetch("/api/companies/bookmarks");
      const data = await res.json();
      if (data.success) {
        setBookmarks(data.data.map((b) => b.id));
      }
    } catch (error) {
      console.error("Failed to fetch bookmarks:", error);
    }
  };

  const handleBookmark = async (devId) => {
    const isBookmarked = bookmarks.includes(devId);
    const method = isBookmarked ? "DELETE" : "POST";

    try {
      const res = await fetch(`/api/companies/bookmarks/${devId}`, { method });
      if (res.ok) {
        setBookmarks((prev) =>
          isBookmarked ? prev.filter((id) => id !== devId) : [...prev, devId],
        );
      }
    } catch (error) {
      console.error("Bookmark action failed:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
          <FaUsers className="text-primary" />
          Talent Discovery
        </h1>
        <p className="text-muted-foreground">
          Find top developers vetted by the SkillBridge Trust Layer.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, skills, or bio..."
            className="pl-10 bg-background/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchDevelopers()}
          />
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min Reputation"
            className="w-32 bg-background/50"
            value={minRep}
            onChange={(e) => setMinRep(e.target.value)}
          />
          <Button onClick={fetchDevelopers}>Search</Button>
          <Button variant="outline" className="gap-2">
            <FaFilter /> Filters
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {developers.map((dev) => (
            <DeveloperCard
              key={dev.id}
              developer={dev}
              isBookmarked={bookmarks.includes(dev.id)}
              onBookmark={handleBookmark}
            />
          ))}
        </div>
      )}

      {!loading && developers.length === 0 && (
        <div className="text-center py-20 bg-muted/20 rounded-2xl">
          <p className="text-muted-foreground">
            No developers found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
}
