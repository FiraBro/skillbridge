import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobService } from "@/services";
import { toast } from "react-toastify";

/* =========================
   Queries
========================= */

export const useJobs = (params) => {
  return useQuery({
    queryKey: ["jobs", params],
    queryFn: () => jobService.getAll(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useRecommendedJobs = () => {
  return useQuery({
    queryKey: ["jobs", "recommended"],
    queryFn: jobService.getRecommended,
    staleTime: 1000 * 60 * 5,
  });
};

export const useJobDetail = (id) => {
  return useQuery({
    queryKey: ["jobs", id],
    queryFn: () => jobService.getById(id),
    enabled: !!id,
  });
};

export const useCompanyJobs = () => {
  return useQuery({
    queryKey: ["jobs", "company"],
    queryFn: jobService.getCompanyJobs,
    staleTime: 1000 * 60 * 2,
  });
};

/* =========================
   Mutations
========================= */

export const useApplyJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => jobService.apply(id, data),

    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["jobs", id] });

      toast.success("Application submitted");
    },

    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to apply for job");
    },
  });
};

export const useCreateJob = (navigate) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: jobService.create,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });

      toast.success("Job posted successfully");

      navigate("/company-dashboard");
    },

    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to create job");
    },
  });
};
