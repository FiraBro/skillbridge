import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { companyService } from "@/services";
export const useDeveloperDiscovery = ({ search, minReputation }) => {
  const queryClient = useQueryClient();

  // 1. Fetch Developers (Talent Discovery)
  const developersQuery = useQuery({
    queryKey: ["developers", "discovery", { search, minReputation }],
    queryFn: () =>
      companyService.discoverTalent({ q: search, reputation: minReputation }),
    placeholderData: keepPreviousData, // Updated for TanStack v5
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // 2. Fetch Bookmarks
  const bookmarksQuery = useQuery({
    queryKey: ["company", "bookmarks"],
    queryFn: companyService.getBookmarks,
  });

  // 3. Toggle Bookmark Mutation
  const bookmarkMutation = useMutation({
    // Logic: If already bookmarked, remove it. Otherwise, add it.
    mutationFn: (developer) => {
      const isBookmarked = bookmarksQuery.data?.some(
        (b) => b.id === developer.id,
      );
      return isBookmarked
        ? companyService.removeBookmark(developer.id)
        : companyService.bookmarkDeveloper(developer.id);
    },
    // OPTIMISTIC UPDATE: Update the UI immediately before the server responds
    onMutate: async (developer) => {
      await queryClient.cancelQueries({ queryKey: ["company", "bookmarks"] });
      const previousBookmarks = queryClient.getQueryData([
        "company",
        "bookmarks",
      ]);

      queryClient.setQueryData(["company", "bookmarks"], (old = []) => {
        const exists = old.find((b) => b.id === developer.id);
        return exists
          ? old.filter((b) => b.id !== developer.id)
          : [...old, developer];
      });

      return { previousBookmarks };
    },
    onError: (err, developer, context) => {
      queryClient.setQueryData(
        ["company", "bookmarks"],
        context.previousBookmarks,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["company", "bookmarks"] });
    },
  });

  return {
    developers: developersQuery.data?.data || [], // Access .data if using axios wrapper
    bookmarks: bookmarksQuery.data?.data || [],
    isLoading: developersQuery.isLoading || bookmarksQuery.isLoading,
    isError: developersQuery.isError,
    toggleBookmark: bookmarkMutation.mutate,
    isUpdatingBookmark: bookmarkMutation.isPending,
  };
};
