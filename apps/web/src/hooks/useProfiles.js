import { useQuery } from "@tanstack/react-query";
import { profileService } from "@/services";

export const useProfile = (username) => {
  return useQuery({
    queryKey: ["profile", username],
    queryFn: () => profileService.getByUsername(username),
    enabled: !!username,
  });
};

export const useReputation = (userId) => {
  return useQuery({
    queryKey: ["reputation", userId],
    queryFn: () => profileService.getReputation(userId),
    enabled: !!userId,
  });
};

export const useReputationHistory = (userId) => {
  return useQuery({
    queryKey: ["reputation-history", userId],
    queryFn: () => profileService.getHistory(userId),
    enabled: !!userId,
  });
};

export const useDeveloperDiscovery = (params) => {
  return useQuery({
    queryKey: ["developers", "discovery", params],
    queryFn: () => profileService.discover(params),
  });
};
