import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDevelopers, fetchBookmarks, toggleBookmark } from "@/api";

export const useDeveloperDiscovery = ({ search, minReputation }) => {
  const queryClient = useQueryClient();

  const developersQuery = useQuery({
    queryKey: ["developers", search, minReputation],
    queryFn: () => fetchDevelopers({ search, minReputation }),
    keepPreviousData: true,
  });

  const bookmarksQuery = useQuery({
    queryKey: ["bookmarks"],
    queryFn: fetchBookmarks,
  });

  const bookmarkMutation = useMutation({
    mutationFn: toggleBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries(["bookmarks"]);
    },
  });

  return {
    developers: developersQuery.data || [],
    bookmarks: bookmarksQuery.data || [],
    isLoading: developersQuery.isLoading,
    toggleBookmark: bookmarkMutation.mutate,
  };
};
