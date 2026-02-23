import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postService } from "@/services";

/* ============================
   POSTS QUERIES
============================ */
export const usePosts = ({
  page = 1,
  limit = 10,
  sortBy = "relevant",
  tag,
  authorId,
}) => {
  return useQuery({
    queryKey: ["posts", sortBy, page, limit, tag, authorId],
    queryFn: () =>
      postService.getAll({
        page,
        limit,
        sortBy,
        tag,
        authorId,
      }),
    staleTime: 0,
    keepPreviousData: true,
  });
};

export const usePostDetail = (slug) => {
  return useQuery({
    queryKey: ["posts", slug],
    queryFn: () => postService.getBySlug(slug),
    enabled: !!slug,
  });
};

const updateLocalCache = (queryClient, id, newValue, action) => {
  queryClient.setQueriesData({ queryKey: ["posts"], exact: false }, (old) => {
    if (!old) return old;
    const transform = (item) => {
      if (Array.isArray(item)) return item.map(transform);
      if (item && typeof item === "object") {
        // Force ID string comparison to avoid UUID mismatch
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

export const useToggleFollow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (authorId) => postService.toggleFollow(authorId),

    onMutate: async (authorId) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      // Snapshot all post queries
      const previousQueries = queryClient.getQueriesData({
        queryKey: ["posts"],
      });

      // 🔑 Determine current follow state from cache
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

      // ✅ Optimistically TOGGLE
      updateLocalCache(queryClient, authorId, !currentValue, "follow");

      return { previousQueries };
    },

    onSuccess: (res, authorId) => {
      // ✅ use backend truth
      updateLocalCache(
        queryClient,
        authorId,
        res.following, // 🔥 correct field
        "follow",
      );
    },

    onError: (_err, _authorId, context) => {
      // Rollback everything
      if (context?.previousQueries) {
        context.previousQueries.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      toast.error("Follow action failed");
    },

    onSettled: () => {
      // Final sync with DB
      queryClient.invalidateQueries({ queryKey: ["posts"] });
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

/* ============================
   SHARE POST
============================ */
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

      // Optimistically increment the count
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

/* ============================
   COMMENTS & POSTS MANAGEMENT
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
