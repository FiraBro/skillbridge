import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { notificationService } from "@/services/notification.service";

export const useNotifications = () => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await notificationService.getNotifications();
      // Since apiClient returns response.data, and your controller
      // returns apiResponse.success(notifications), the array is in .data
      return response.data || [];
    },
    staleTime: 30000,
    // Note: 'cacheTime' is now 'gcTime' in TanStack Query v5
    gcTime: 60000,
    onError: (error) => {
      toast.error(error.message || "Failed to load notifications");
    },
  });
};

export const useContactMutation = () => {
  const queryClient = useQueryClient();

  // Unified mutation for sending and responding
  const mutation = useMutation({
    mutationFn: async ({ action, id, payload }) => {
      if (action === "send") {
        return await notificationService.sendRequest(payload);
      }
      if (action === "respond") {
        return await notificationService.respondToRequest(id, payload);
      }
      throw new Error("Invalid action");
    },
    onSuccess: (response, variables) => {
      // Refresh the feed instantly
      queryClient.invalidateQueries(["notifications"]);

      if (variables.action === "send") {
        toast.success("Contact request sent!");
      } else {
        const status = variables.payload.status;
        toast.info(`Request ${status}`);
      }
    },
    onError: (error) => {
      // Uses the error message from your api.client.js interceptor
      toast.error(error.message || "Action failed");
    },
  });

  return {
    sendRequest: (receiverId, message) =>
      mutation.mutate({
        action: "send",
        payload: { receiverId, message },
      }),
    respondToRequest: (requestId, status) =>
      mutation.mutate({
        action: "respond",
        id: requestId,
        payload: { status },
      }),
    isLoading: mutation.isLoading,
    isError: mutation.isError,
  };
};
