import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobService } from "@/services";

export const useJobs = (params) => {
  return useQuery({
    queryKey: ["jobs", params],
    queryFn: () => jobService.getAll(params),
  });
};

export const useRecommendedJobs = () => {
  return useQuery({
    queryKey: ["jobs", "recommended"],
    queryFn: () => jobService.getRecommended(),
  });
};

export const useJobDetail = (id) => {
  return useQuery({
    queryKey: ["jobs", id],
    queryFn: () => jobService.getById(id),
    enabled: !!id,
  });
};

export const useApplyJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => jobService.apply(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobs", id] });
    },
  });
};
