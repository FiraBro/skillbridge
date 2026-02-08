import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDevelopers,
  getBookmarks,
  toggleBookmark,
} from "@/services/talentDiscovery.js";

export function useDevelopers(params) {
  return useQuery({
    queryKey: ["developers", params],
    queryFn: () => getDevelopers(params),
    keepPreviousData: true,
  });
}

export function useBookmarks() {
  return useQuery({
    queryKey: ["bookmarks"],
    queryFn: getBookmarks,
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ devId, isBookmarked }) =>
      toggleBookmark(devId, isBookmarked),
    onSuccess: () => {
      queryClient.invalidateQueries(["bookmarks"]);
    },
  });
}
