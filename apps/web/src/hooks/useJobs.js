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
    staleTime: 1000 * 60 * 2,
  });
};

export const useRecommendedJobs = () => {
  return useQuery({
    queryKey: ["jobs", "recommended"],
    queryFn: () => jobService.getRecommended(),
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
    queryFn: () => jobService.getCompanyJobs(),
    staleTime: 1000 * 60 * 2,
  });
};

// Added: Fetch applicants for a specific job
export const useJobApplicants = (jobId) => {
  return useQuery({
    queryKey: ["jobs", jobId, "applicants"],
    queryFn: () => jobService.getApplicants(jobId), // Ensure this exists in your jobService
    enabled: !!jobId,
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

// Added: Mutation for Hiring/Feedback (Fixes your 500 error route)
export const useUpdateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // applicationId is passed as part of the object
    mutationFn: ({ applicationId, data }) =>
      jobService.updateApplicationStatus(applicationId, data),

    onSuccess: (response) => {
      // Invalidate the company jobs and applicants list to show the new status
      queryClient.invalidateQueries({ queryKey: ["jobs", "company"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });

      const status = response?.data?.hiring_status || "updated";
      toast.success(`Application ${status} successfully`);
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to update application",
      );
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
      if (navigate) navigate("/company-dashboard");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to create job");
    },
  });
};
