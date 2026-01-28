import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FaEye, FaEnvelope, FaCheck, FaTimes, FaBell } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

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
          title: `Request ${status}`,
          description:
            status === "accepted"
              ? "The company has been notified."
              : "Request ignored.",
        });
        fetchNotifications();
      }
    } catch (error) {
      console.error("Failed to respond to request:", error);
    }
  };

  if (!loading && notifications.length === 0) {
    return (
      <Card className="p-12 bg-card/30 backdrop-blur-sm border-dashed border-2 border-border/50 text-center">
        <div className="p-4 rounded-full bg-muted/20 w-fit mx-auto mb-4">
          <FaBell className="text-3xl text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-bold text-muted-foreground">
          All caught up!
        </h3>
        <p className="text-sm text-muted-foreground">
          Your notifications and requests will appear here.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <FaBell className="text-primary" />
        Recent Activity
      </h2>

      <div className="space-y-3">
        {loading
          ? [1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
            ))
          : notifications.map((notif) => (
              <Card
                key={`${notif.type}-${notif.id}`}
                className={`p-4 bg-card/50 backdrop-blur-sm border-border/50 transition-all hover:bg-card/80 ${
                  notif.type === "contact_request" && notif.status === "pending"
                    ? "ring-1 ring-primary/30"
                    : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      notif.type === "profile_view"
                        ? "bg-blue-500/10 text-blue-500"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {notif.type === "profile_view" ? <FaEye /> : <FaEnvelope />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm">
                          {notif.type === "profile_view" ? (
                            <>A company representative viewed your profile</>
                          ) : (
                            <>{notif.actor_name} wants to connect</>
                          )}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notif.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      {notif.type === "contact_request" && (
                        <Badge
                          variant={
                            notif.status === "pending" ? "default" : "secondary"
                          }
                          className="text-[10px] uppercase"
                        >
                          {notif.status}
                        </Badge>
                      )}
                    </div>

                    {notif.message && (
                      <p className="mt-2 text-sm text-muted-foreground bg-background/30 p-2 rounded italic">
                        "{notif.message}"
                      </p>
                    )}

                    {notif.type === "contact_request" &&
                      notif.status === "pending" && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            className="h-8 gap-1"
                            onClick={() => handleResponse(notif.id, "accepted")}
                          >
                            <FaCheck className="w-3 h-3" /> Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1"
                            onClick={() => handleResponse(notif.id, "ignored")}
                          >
                            <FaTimes className="w-3 h-3" /> Ignore
                          </Button>
                        </div>
                      )}
                  </div>
                </div>
              </Card>
            ))}
      </div>
    </div>
  );
}
