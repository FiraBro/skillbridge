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
      // 1. Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      // 2. Snapshot ALL current post queries (captures every sortBy/page variation)
      const previousQueries = queryClient.getQueriesData({
        queryKey: ["posts"],
      });

      // 3. Optimistically update the UI to "true" (Following)
      updateLocalCache(queryClient, authorId, true, "follow");

      // 4. Return the full snapshot for rollback
      return { previousQueries };
    },

    onSuccess: (res, authorId) => {
      // res.is_following_author should be true here from your backend
      updateLocalCache(
        queryClient,
        authorId,
        res.is_following_author,
        "follow",
      );
    },

    onError: (err, authorId, context) => {
      // 5. If it fails, rollback every query key we captured in onMutate
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, oldData]) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
      toast.error("Follow action failed");
    },

    onSettled: () => {
      // 6. Refresh in the background to ensure absolute sync with DB
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

// const updateLocalCache = (queryClient, id, newValue, action = "like") => {
//   // Use 'exact: false' to catch all variations of the "posts" query
//   queryClient.setQueriesData({ queryKey: ["posts"], exact: false }, (old) => {
//     if (!old) return old;

//     const transform = (item) => {
//       if (Array.isArray(item)) return item.map(transform);
//       if (String(item.author_id) === String(id)) {
//         console.log("MATCH FOUND! Changing follow state to:", newValue);
//       }

//       if (item && typeof item === "object") {
//         // --- FIX FOR FOLLOW ---
//         // We match item.author_id because multiple posts can have the same author
//         if (action === "follow" && String(item.author_id) === String(id)) {
//           return { ...item, is_following_author: newValue };
//         }

//         // --- FIX FOR SHARE ---
//         if (action === "share" && String(item.id) === String(id)) {
//           return {
//             ...item,
//             shares_count: (Number(item.shares_count) || 0) + 1,
//           };
//         }

//         // --- FIX FOR LIKE ---
//         if (action === "like" && String(item.id) === String(id)) {
//           const currentLikes = Number(item.likes_count) || 0;
//           return {
//             ...item,
//             is_liked: newValue,
//             likes_count: newValue
//               ? currentLikes + 1
//               : Math.max(0, currentLikes - 1),
//           };
//         }

//         // Handle nested data (e.g., if API returns { data: [...] })
//         const next = {};
//         for (const key in item) {
//           next[key] = transform(item[key]);
//         }
//         return next;
//       }
//       return item;
//     };
//     return transform(old);
//   });
// };
// export const useToggleFollow = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (authorId) => postService.toggleFollow(authorId),

//     onMutate: async (authorId) => {
//       await queryClient.cancelQueries({ queryKey: ["posts"] });
//       const previousData = queryClient.getQueryData(["posts"]);

//       // Optimistic update
//       updateLocalCache(queryClient, authorId, true, "follow");

//       return { previousData };
//     },

//     onSuccess: (res, authorId) => {
//       // Use the server's confirmed state: res.is_following_author
//       updateLocalCache(
//         queryClient,
//         authorId,
//         res.is_following_author,
//         "follow",
//       );
//     },

//     onError: (err, authorId, context) => {
//       if (context?.previousData) {
//         queryClient.setQueryData(["posts"], context.previousData);
//       }
//       toast.error("Follow failed");
//     },

//     // REMOVE invalidateQueries from here or delay it
//     onSettled: () => {
//       // Optional: only invalidate after a delay to ensure DB is ready
//       // setTimeout(() => queryClient.invalidateQueries({ queryKey: ["posts"] }), 1000);
//     },
//   });
// };

/* ============================
   LIKE POST
============================ */
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
