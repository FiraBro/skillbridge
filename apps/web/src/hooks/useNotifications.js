import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { notificationService } from "@/services";
import { useAuth } from "@/hooks/useAuth";

// 1. Hook for General Notifications (Profile views, etc.)
export const useNotifications = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await notificationService.getNotifications();
      return response.data || [];
    },
    enabled: !!user,
    staleTime: 30000,
  });
};

// 2. NEW: Hook for the Inbox (List of active chats)
export const useInbox = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["inbox"],
    queryFn: async () => {
      const response = await notificationService.getInbox();
      return response.data || [];
    },
    enabled: !!user,
  });
};

// 3. NEW: Hook for Chat History (The messages between two people)
export const useChatHistory = (partnerId) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["chat", partnerId],
    queryFn: async () => {
      const response = await notificationService.getChatHistory(partnerId);
      return response.data || [];
    },
    enabled: !!user && !!partnerId,
  });
};

// 4. UPDATED: Mutation for Messaging
export const useChatMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ receiverId, message }) => {
      return await notificationService.sendMessage({ receiverId, message });
    },
    onSuccess: (_, variables) => {
      // Refresh the specific chat and the inbox list
      queryClient.invalidateQueries({
        queryKey: ["chat", variables.receiverId],
      });
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      toast.success("Message sent!");
    },
    onError: (error) => {
      const msg = error.response?.data?.message || "Failed to send message";
      toast.error(msg);
    },
  });
};
