import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { notificationService } from "@/services";
import { useAuth } from "@/hooks/useAuth"; // Ensure you have an auth hook

export const useNotifications = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await notificationService.getNotifications();

      // DEBUG: See exactly what the hook is about to return to the UI
      console.log("Hook receiving from service:", response.data);

      if (response.data) {
        return response.data;
      }

      // If your backend returns the array directly [...]
      return Array.isArray(response.data) ? response.data : [];
    },
    staleTime: 30000,
    gcTime: 60000,
    enabled: !!user,
  });
};

export const useContactMutation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ action, id, payload }) => {
      if (action === "send")
        return await notificationService.sendRequest(payload);
      if (action === "respond")
        return await notificationService.respondToRequest(id, payload);
      throw new Error("Invalid action");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      if (variables.action === "send") {
        toast.success("Contact request sent!");
      } else {
        toast.info(`Request ${variables.payload.status}`);
      }
    },
    onError: (error) => {
      const msg =
        error.response?.data?.message || error.message || "Action failed";
      toast.error(msg);
    },
  });

  return {
    sendRequest: (receiverId, message) =>
      mutation.mutate({ action: "send", payload: { receiverId, message } }),
    respondToRequest: (requestId, status) =>
      mutation.mutate({
        action: "respond",
        id: requestId,
        payload: { status },
      }),
    isPending: mutation.isPending, // v5: renamed from isLoading
    isError: mutation.isError,
  };
};
