import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FaStar,
  FaBookmark,
  FaRegBookmark,
  FaArrowRight,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function DeveloperListItem({
  developer,
  isBookmarked,
  onBookmark,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="border rounded-xl bg-card hover:border-primary/40 transition"
    >
      <div className="flex items-center gap-5 p-5">
        {/* Avatar */}
        <Avatar className="h-14 w-14 border">
          <AvatarImage src={developer.avatar_url} />
          <AvatarFallback>{developer.name?.charAt(0)}</AvatarFallback>
        </Avatar>

        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold truncate">{developer.name}</h3>

            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <FaStar className="text-yellow-500 text-xs" />
              {developer.reputation_score}
            </span>
          </div>

          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
            {developer.bio || "No bio provided"}
          </p>

          {/* Skills */}
          <div className="flex flex-wrap gap-2 mt-2">
            {developer.skills?.slice(0, 5).map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {developer.skills?.length > 5 && (
              <span className="text-xs text-muted-foreground">
                +{developer.skills.length - 5} more
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onBookmark?.(developer.id)}
            className="text-muted-foreground hover:text-primary"
          >
            {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
          </Button>

          <Link to={`/profile/${developer.profile_id}`}>
            <Button variant="outline" size="sm" className="gap-2">
              View
              <FaArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
