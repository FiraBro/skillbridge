import { useQuery } from "@tanstack/react-query";
import { profileService } from "@/services";

export const useProfile = (username) => {
  return useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      const res = await profileService.getByUsername(username);
      return res; // res is already data
    },
    enabled: !!username,
  });
};

export const useReputation = (userId) => {
  return useQuery({
    queryKey: ["reputation", userId],
    queryFn: async () => {
      const res = await profileService.getReputation(userId);
      return res;
    },
    enabled: !!userId,
  });
};

export const useReputationHistory = (userId) => {
  return useQuery({
    queryKey: ["reputation-history", userId],
    queryFn: async () => {
      const res = await profileService.getHistory(userId);
      return res;
    },
    enabled: !!userId,
  });
};
