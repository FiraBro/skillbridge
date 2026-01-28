import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  FaStar,
  FaGithub,
  FaBookmark,
  FaRegBookmark,
  FaArrowRight,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function DeveloperCard({ developer, isBookmarked, onBookmark }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors group">
        <div className="flex gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src={developer.avatar_url} />
            <AvatarFallback>{developer.name?.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold group-hover:text-primary transition-colors truncate">
                  {developer.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <FaStar className="text-yellow-500" />
                  <span className="font-bold text-foreground">
                    {developer.reputation_score} Reputation
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary"
                onClick={() => onBookmark?.(developer.id)}
              >
                {isBookmarked ? (
                  <FaBookmark className="text-primary" />
                ) : (
                  <FaRegBookmark />
                )}
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
              {developer.bio || "No bio available."}
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              {developer.skills?.slice(0, 4).map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-primary/5 text-primary-foreground/80 border-primary/10"
                >
                  {skill}
                </Badge>
              ))}
              {developer.skills?.length > 4 && (
                <Badge variant="ghost" className="text-xs">
                  +{developer.skills.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Link to={`/profile/${developer.profile_id}`} className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              View Profile <FaArrowRight className="w-3 h-3" />
            </Button>
          </Link>
          <Button className="flex-1">Contact</Button>
        </div>
      </Card>
    </motion.div>
  );
}
