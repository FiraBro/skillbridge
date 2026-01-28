import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  MessageSquare,
  Check,
  X,
  Terminal,
  Activity,
  UserCheck,
  Zap,
  Clock,
  ArrowRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (id, status) => {
    try {
      const res = await fetch(`/api/notifications/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: `Request ${status.toUpperCase()}`,
          description:
            status === "accepted"
              ? "Handshake protocol initiated."
              : "Request archived.",
        });
        fetchNotifications();
      }
    } catch (error) {
      console.error("Failed to respond:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card className="p-20 bg-muted/5 border-dashed border-2 border-primary/20 text-center rounded-3xl group">
        <div className="p-6 rounded-full bg-primary/5 w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
          <Terminal className="text-4xl text-primary/40" />
        </div>
        <h3 className="text-xl font-black italic tracking-tighter opacity-50 uppercase">
          Command Log: Empty
        </h3>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-2">
          Standing by for platform interactions...
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <Activity className="h-4 w-4" /> Command Log
        </h2>
        <Badge
          variant="secondary"
          className="font-bold text-[10px] py-0.5 px-2 bg-primary/10 text-primary border-primary/20"
        >
          LIVE FEED
        </Badge>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {notifications.map((notif, index) => (
            <motion.div
              key={`${notif.type}-${notif.id}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`p-6 bg-card border-border/50 transition-all hover:bg-muted/30 group relative overflow-hidden rounded-2xl ${
                  notif.type === "contact_request" && notif.status === "pending"
                    ? "border-primary/30 shadow-lg shadow-primary/5"
                    : ""
                }`}
              >
                <div className="flex items-start gap-6 relative z-10">
                  <div
                    className={`p-4 rounded-xl shadow-sm ${
                      notif.type === "profile_view"
                        ? "bg-blue-500/10 text-blue-500"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {notif.type === "profile_view" ? (
                      <Eye className="h-5 w-5" />
                    ) : (
                      <UserCheck className="h-5 w-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-bold text-lg tracking-tight group-hover:text-primary transition-colors">
                          {notif.type === "profile_view"
                            ? "Profile Discovery Event"
                            : `${notif.actor_name} initiated Contact Protocol`}
                        </h4>
                        <div className="flex items-center gap-3 text-[10px] font-bold uppercase text-muted-foreground italic">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />{" "}
                            {formatDistanceToNow(new Date(notif.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                          <span className="text-primary italic">
                            Verified Interaction
                          </span>
                        </div>
                      </div>

                      {notif.type === "contact_request" && (
                        <Badge
                          variant={
                            notif.status === "pending" ? "default" : "secondary"
                          }
                          className="text-[10px] font-black uppercase tracking-widest rounded-md"
                        >
                          {notif.status}
                        </Badge>
                      )}
                    </div>

                    {notif.message && (
                      <div className="mt-4 p-4 rounded-xl bg-muted/50 border border-border/30 relative">
                        <MessageSquare className="absolute -top-3 -left-3 h-8 w-8 text-primary/10" />
                        <p className="text-sm font-medium italic text-foreground/80 leading-relaxed">
                          "{notif.message}"
                        </p>
                      </div>
                    )}

                    {notif.type === "contact_request" &&
                      notif.status === "pending" && (
                        <div className="flex gap-3 mt-6">
                          <Button
                            className="rounded-lg font-black text-xs uppercase h-10 px-8 shadow-lg shadow-primary/10 transition-transform active:scale-95"
                            onClick={() => handleResponse(notif.id, "accepted")}
                          >
                            <Check className="mr-2 h-4 w-4" /> Finalize
                            Handshake
                          </Button>
                          <Button
                            variant="outline"
                            className="rounded-lg font-bold text-xs uppercase h-10 px-8 hover:bg-red-500/5 hover:text-red-500 hover:border-red-500/30 transition-all active:scale-95"
                            onClick={() => handleResponse(notif.id, "ignored")}
                          >
                            <X className="mr-2 h-4 w-4" /> Archive
                          </Button>
                        </div>
                      )}
                  </div>
                </div>

                <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="h-4 w-4 text-primary" />
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
