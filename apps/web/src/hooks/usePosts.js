import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postService } from "@/services";

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

export const useLikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => postService.like(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const useUnlikePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => postService.unlike(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
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
