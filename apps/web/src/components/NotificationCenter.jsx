import React, { forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, UserPlus, Bell, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNotifications, useContactMutation } from "@/hooks/useNotifications";
import { useClickOutside } from "@/hooks/useClickOutside";

/**
 * Individual Notification Card logic
 */
const NotificationItem = ({ notification }) => {
  const { respondToRequest, isPending: isLoading } = useContactMutation();

  const handleAction = (status) => {
    respondToRequest(notification.id, status);
  };

  const getIcon = (type) => {
    switch (type) {
      case "profile_view":
        return <Eye className="h-5 w-5 text-blue-500" />;
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`p-4 rounded-lg border transition-all ${
        notification.read
          ? "bg-muted/20 opacity-80"
          : "bg-background shadow-sm border-primary/10"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 p-2 bg-secondary/30 rounded-full">
          {getIcon(notification.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold truncate">
              {notification.actor_name || "Someone"}
              <span className="font-normal text-muted-foreground ml-1">
                {notification.type === "profile_view" && "viewed your profile"}
                {notification.type === "contact_request" &&
                  "sent a connection request"}
                {notification.type === "request_accepted" &&
                  "accepted your contact request"}
              </span>
            </p>
            {!notification.read && (
              <Badge className="h-2 w-2 rounded-full p-0 bg-blue-500" />
            )}
          </div>

          {notification.message && notification.type !== "request_accepted" && (
            <p className="text-xs text-muted-foreground mt-1 bg-muted/50 p-2 rounded italic">
              "{notification.message}"
            </p>
          )}

          <div className="flex items-center gap-2 mt-3">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
              <Clock className="h-3 w-3" />
              {formatDate(notification.created_at)}
            </span>

            <div className="ml-auto flex gap-2">
              {notification.type === "contact_request" &&
              notification.status === "pending" ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-3 text-xs text-destructive hover:bg-destructive/10"
                    onClick={() => handleAction("ignored")}
                    disabled={isLoading}
                  >
                    Ignore
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 px-3 text-xs"
                    onClick={() => handleAction("accepted")}
                    disabled={isLoading}
                  >
                    Accept
                  </Button>
                </>
              ) : (
                notification.status && (
                  <Badge
                    variant="outline"
                    className={`text-[10px] capitalize ${
                      notification.status === "accepted"
                        ? "text-green-600 border-green-200 bg-green-50"
                        : "text-muted-foreground"
                    }`}
                  >
                    {notification.status}
                  </Badge>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Dropdown Menu used in Navbar
 */
const NotificationDropdown = forwardRef(
  ({ isOpen, onClose, onSeeAll }, ref) => {
    const dropdownRef = useClickOutside(onClose);
    const { data: notifications = [], isLoading } = useNotifications();

    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 z-50 shadow-xl"
            ref={dropdownRef}
          >
            <Card className="border shadow-2xl overflow-hidden">
              <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-md font-bold flex items-center gap-2">
                  <Bell className="h-4 w-4" /> Notifications
                </CardTitle>
                {notifications.length > 0 && (
                  <Badge variant="secondary" className="text-[10px]">
                    {notifications.length} Total
                  </Badge>
                )}
              </CardHeader>
              <Separator />
              <CardContent className="p-0">
                <div className="max-h-[400px] overflow-y-auto p-2 space-y-2">
                  {isLoading ? (
                    <div className="py-10 text-center text-sm text-muted-foreground animate-pulse">
                      Loading notifications...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                      All caught up!
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <NotificationItem key={n.id} notification={n} />
                    ))
                  )}
                </div>
                <Separator />
                <Button
                  variant="ghost"
                  className="w-full rounded-none text-xs text-primary font-bold"
                  onClick={onSeeAll}
                >
                  View All Activity
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    );
  },
);

NotificationDropdown.displayName = "NotificationDropdown";

/**
 * Full Notification Page View
 */
export default function NotificationPage() {
  const { data: notifications = [], isLoading } = useNotifications();

  return (
    <div className="container max-w-2xl py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">
            Activity
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Stay updated on profile views and connection requests.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 w-full bg-muted animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <Card className="p-10 text-center border-dashed">
            <p className="text-muted-foreground">No recent activity found.</p>
          </Card>
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
}

export { NotificationItem, NotificationDropdown };
