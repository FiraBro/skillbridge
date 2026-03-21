import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { postService } from "@/services";
import { toast } from "react-toastify";

/* ============================
   POSTS QUERIES
============================ */
export const usePosts = ({
  page = 1,
  limit = 10,
  sortBy = "relevant",
  tag,
  authorId,
  userId, // Added userId to query key for unique user caches
}) => {
  return useQuery({
    // Included all dependencies in the key to prevent data mixing
    queryKey: ["posts", sortBy, page, limit, tag, authorId, userId],
    queryFn: () =>
      postService.getAll({
        page,
        limit,
        sortBy,
        tag,
        authorId,
      }),

    // 🚀 FIX FOR LATENCY:
    // 1. Keeps current data on screen while fetching new data (no blank screens)
    placeholderData: keepPreviousData,

    // 2. Data is considered "fresh" for 5 mins. Switching back to a tab is now INSTANT.
    staleTime: 1000 * 60 * 5,

    // 3. Keep unused data in cache for 10 mins before deleting
    gcTime: 1000 * 60 * 10,
  });
};

export const usePostDetail = (slug) => {
  return useQuery({
    queryKey: ["posts", slug],
    queryFn: () => postService.getBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 2, // 2 minutes for post details
  });
};

/* ============================
   CACHE UTILS (Optimistic Updates)
============================ */
const updateLocalCache = (queryClient, id, newValue, action) => {
  queryClient.setQueriesData({ queryKey: ["posts"], exact: false }, (old) => {
    if (!old) return old;
    const transform = (item) => {
      if (Array.isArray(item)) return item.map(transform);
      if (item && typeof item === "object") {
        if (action === "follow" && String(item.author_id) === String(id)) {
          return { ...item, is_following_author: newValue };
        }
        if (action === "like" && String(item.id) === String(id)) {
          const count = Number(item.likes_count) || 0;
          return {
            ...item,
            is_liked: newValue,
            likes_count: newValue ? count + 1 : Math.max(0, count - 1),
          };
        }
        if (action === "share" && String(item.id) === String(id)) {
          return {
            ...item,
            shares_count: (Number(item.shares_count) || 0) + 1,
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
   MUTATIONS
============================ */
export const useToggleFollow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (authorId) => postService.toggleFollow(authorId),
    onMutate: async (authorId) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previousQueries = queryClient.getQueriesData({
        queryKey: ["posts"],
      });
      let currentValue = false;
      for (const [, data] of previousQueries) {
        if (Array.isArray(data)) {
          const found = data.find(
            (p) => String(p.author_id) === String(authorId),
          );
          if (found) {
            currentValue = !!found.is_following_author;
            break;
          }
        }
      }
      updateLocalCache(queryClient, authorId, !currentValue, "follow");
      return { previousQueries };
    },
    onSuccess: (res, authorId) => {
      updateLocalCache(queryClient, authorId, res.following, "follow");
    },
    onError: (_err, _authorId, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      toast.error("Follow action failed");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const useToggleLikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, isLiked }) =>
      isLiked ? postService.unlike(id) : postService.like(id),
    onMutate: async ({ id, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: ["posts"], exact: false });
      const previousData = queryClient.getQueriesData({
        queryKey: ["posts"],
        exact: false,
      });
      updateLocalCache(queryClient, id, !isLiked, "like");
      return { previousData };
    },
    onError: (_, __, context) => {
      context?.previousData?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
  });
};

export const useSharePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => postService.share(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["posts"], exact: false });
      const previousData = queryClient.getQueriesData({
        queryKey: ["posts"],
        exact: false,
      });
      updateLocalCache(queryClient, id, null, "share");
      return { previousData };
    },
    onError: (_, __, context) => {
      context?.previousData?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
  });
};

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
    mutationFn: ({ postId, commentId }) =>
      postService.deleteComment(postId, commentId),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ["posts", postId] });
      queryClient.invalidateQueries({
        queryKey: ["posts", postId, "comments"],
      });
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => postService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["posts", id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => postService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};
