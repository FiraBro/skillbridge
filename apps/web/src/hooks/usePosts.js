import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postService } from "@/services";

/* ============================
   POSTS QUERIES
============================ */

export const usePosts = (params) => {
  return useQuery({
    queryKey: ["posts", params],
    queryFn: () => postService.getAll(params),
  });
};

export const usePostDetail = (slug) => {
  return useQuery({
    queryKey: ["posts", slug],
    queryFn: () => postService.getBySlug(slug),
    enabled: !!slug,
  });
};

/* ============================
   UNIVERSAL CACHE UPDATER
   (works for arrays & objects)
============================ */

const updateLocalCache = (queryClient, postId, nextIsLiked) => {
  queryClient.setQueriesData({ queryKey: ["posts"], exact: false }, (old) => {
    if (!old) return old;

    const transform = (item) => {
      if (Array.isArray(item)) return item.map(transform);

      if (item && typeof item === "object") {
        if (item.id === postId) {
          if (item.is_liked === nextIsLiked) {
            return item;
          }

          const currentLikes = Number(item.likes_count) || 0;

          return {
            ...item,
            is_liked: nextIsLiked,
            likes_count: nextIsLiked
              ? currentLikes + 1
              : Math.max(0, currentLikes - 1),
          };
        }

        const next = {};
        for (const key in item) {
          next[key] = transform(item[key]);
        }
        return next;
      }

      return item;
    };

    return transform(old);
  });
};

/* ============================
   LIKE POST
============================ */

export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => postService.like(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["posts"], exact: false });

      const previousData = queryClient.getQueriesData({
        queryKey: ["posts"],
        exact: false,
      });

      updateLocalCache(queryClient, id, true);

      return { previousData };
    },

    onError: (_, __, context) => {
      context?.previousData?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
  });
};
export const useToggleLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isLiked }) => {
      return isLiked ? postService.unlike(id) : postService.like(id);
    },

    onMutate: async ({ id, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: ["posts"], exact: false });

      const previousData = queryClient.getQueriesData({
        queryKey: ["posts"],
        exact: false,
      });

      updateLocalCache(queryClient, id, !isLiked);

      return { previousData };
    },

    onError: (_, __, context) => {
      context?.previousData?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
  });
};

export const useUnlikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => postService.unlike(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["posts"], exact: false });

      const previousData = queryClient.getQueriesData({
        queryKey: ["posts"],
        exact: false,
      });

      updateLocalCache(queryClient, id, false);

      return { previousData };
    },

    onError: (_, __, context) => {
      context?.previousData?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
  });
};

/* ============================
   ADD COMMENT
============================ */

export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, text }) => postService.addComment(id, text),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["posts", id] });
      queryClient.invalidateQueries({ queryKey: ["posts", id, "comments"] });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => postService.deleteComment(id),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["posts", id] });
      queryClient.invalidateQueries({ queryKey: ["posts", id, "comments"] });
    },
  });
};
