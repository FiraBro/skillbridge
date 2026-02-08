// apps/web/src/app/profile/components/profile-hero.jsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function ProfileHero({ user, reputation }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>

        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-400 bg-clip-text text-transparent">
              {user.name}
            </h1>
            {user.isAvailable && (
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 animate-pulse">
                ● Open to work
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground flex items-center gap-2">
            📍 {user.location || "Remote"} • Joined {user.joinedDate}
          </p>
        </div>
      </div>

      <p className="text-xl leading-relaxed max-w-2xl line-clamp-2 hover:line-clamp-none transition-all cursor-pointer">
        {user.bio}
      </p>
    </motion.section>
  );
}
