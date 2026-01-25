// apps/web/src/app/profile/hooks/useDeveloperProfile.js
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

const ProfileSchema = z.object({
  user: z.object({
    id: z.string(),
    name: z.string(),
    bio: z.string(),
    location: z.string().optional(),
    avatarUrl: z.string(),
    joinedDate: z.string(),
    isAvailable: z.boolean(),
  }),
  githubStats: z.object({
    username: z.string(),
    stars: z.number(),
    prs: z.number(),
    commits30d: z.number(),
  }),
  skills: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      level: z.enum(["beginner", "intermediate", "expert"]),
      projects: z.number(),
    }),
  ),
  reputation: z.object({
    score: z.number(),
    count: z.number(),
  }),
});

export function useDeveloperProfile(id) {
  return useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const res = await fetch(`/api/profile/${id}`);
      if (!res.ok) throw new Error("Profile not found");
      const data = await res.json();
      return ProfileSchema.parse(data);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
