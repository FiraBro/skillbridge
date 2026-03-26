import React, { forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  UserPlus,
  Bell,
  Clock,
  CheckCircle,
  ArrowRight,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNotifications, useChatMutation } from "@/hooks/useNotifications";
import { useClickOutside } from "@/hooks/useClickOutside";

const NotificationItem = ({ notification, onClose }) => {
  const navigate = useNavigate();
  const { isPending } = useChatMutation();

  const getIcon = (type) => {
    switch (type) {
      case "profile_view":
        return <Eye className="h-5 w-5 text-blue-500" />;
      case "new_message":
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      case "contact_request":
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case "request_accepted":
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-400" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const handleAction = (e) => {
    e.stopPropagation();
    if (onClose) onClose();

    // Redirect logic for Two-Way Chat
    if (
      notification.type === "new_message" ||
      notification.type === "contact_request"
    ) {
      navigate(`/app/chat/${notification.partner_id || ""}`);
    } else if (notification.actor_username) {
      navigate(`/app/profile/${notification.actor_username}`);
    } else {
      navigate("/app/dashboard");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={handleAction}
      className={`p-4 rounded-lg border transition-all cursor-pointer hover:border-primary/40 group relative overflow-hidden ${
        notification.read
          ? "bg-muted/20 opacity-80"
          : "bg-background shadow-sm border-primary/10 hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 p-2 bg-secondary/30 rounded-full shrink-0 group-hover:bg-secondary/50 transition-colors">
          {getIcon(notification.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold truncate leading-none">
              {notification.actor_name || "Someone"}
              <span className="font-normal text-muted-foreground ml-1">
                {notification.type === "profile_view" && "viewed your profile"}
                {notification.type === "new_message" && "sent you a message"}
                {notification.type === "contact_request" &&
                  "sent a connection request"}
                {notification.type === "request_accepted" &&
                  "accepted your request"}
              </span>
            </p>
            {!notification.read && (
              <Badge className="h-2 w-2 rounded-full p-0 bg-blue-500 shrink-0" />
            )}
          </div>

          {/* Show a preview of the message if available */}
          {notification.message && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">
              "{notification.message}"
            </p>
          )}

          <div className="flex items-center gap-2 mt-3">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
              <Clock className="h-3 w-3" />
              {formatDate(notification.created_at)}
            </span>

            <div className="ml-auto">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[10px] font-bold group-hover:text-primary transition-colors"
              >
                {notification.type === "new_message" ? "Reply" : "View"}
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * 2. Dropdown Menu used in Navbar
 */
const NotificationDropdown = forwardRef(({ isOpen, onClose, onSee }, ref) => {
  // We use the internal dropdownRef for click outside detection
  const dropdownRef = useClickOutside(onClose);
  const { data, isLoading } = useNotifications();
  const notifications = Array.isArray(data) ? data : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="absolute right-0 mt-3 w-80 z-[100] shadow-2xl"
          ref={dropdownRef}
        >
          <Card className="border shadow-2xl overflow-hidden bg-background/95 backdrop-blur-md">
            <CardHeader className="p-4 flex flex-row items-center justify-between border-b bg-muted/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" /> Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[420px] overflow-y-auto p-2 space-y-2 custom-scrollbar">
                {isLoading ? (
                  <div className="py-20 text-center animate-pulse text-xs font-medium">
                    Syncing Universe...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center">
                    <Bell className="h-10 w-10 text-primary/20 mb-4" />
                    <h3 className="text-sm font-black italic">
                      Silence is Golden
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-1 px-4">
                      Your digital horizon is clear.
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      onClose={onClose}
                    />
                  ))
                )}
              </div>
              <Separator />
              <Button
                variant="ghost"
                className="w-full rounded-none h-12 text-[11px] text-primary font-black uppercase"
                onClick={onSee}
              >
                View All Activity <ArrowRight className="h-3 w-3 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

/**
 * 3. Full Notification Page View
 */
const NotificationPage = () => {
  const { data, isLoading } = useNotifications();
  const notifications = Array.isArray(data) ? data : [];

  return (
    <div className="container max-w-2xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black italic tracking-tighter uppercase">
          Activity
        </h1>
        <p className="text-muted-foreground text-sm font-medium">
          Manage your requests and profile interactions.
        </p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 w-full bg-muted animate-pulse rounded-lg"
            />
          ))
        ) : notifications.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed rounded-xl">
            <Bell className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="text-lg font-bold">All Quiet Here</h3>
            <p className="text-muted-foreground">
              You don't have any notifications yet.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

NotificationDropdown.displayName = "NotificationDropdown";

// Exports
export { NotificationItem, NotificationDropdown, NotificationPage };
export default NotificationDropdown;
