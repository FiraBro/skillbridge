import { postService } from "@/services";
export const useToggleFollow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (authorId) => postService.toggleFollow(authorId),

    onMutate: async (authorId) => {
      await queryClient.cancelQueries({ queryKey: ["posts"], exact: false });

      const previousData = queryClient.getQueriesData({
        queryKey: ["posts"],
        exact: false,
      });

      // Determine current state to toggle it
      const allPosts = previousData?.[0]?.[1] || [];
      const firstPost = Array.isArray(allPosts)
        ? allPosts.find((p) => p.author_id === authorId)
        : null;
      const isCurrentlyFollowing = firstPost?.is_following_author || false;

      // Optimistically update cache
      updateLocalCache(queryClient, authorId, !isCurrentlyFollowing, "follow");

      return { previousData };
    },

    onError: (_, __, context) => {
      context?.previousData?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },

    onSettled: () => {
      // Re-fetch to let the backend re-sort the "Relevant" feed
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};
