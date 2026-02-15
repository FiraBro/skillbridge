import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { FaPaperPlane, FaUserCheck, FaEnvelope } from "react-icons/fa";
import { toast } from "react-toastify"; // Using toastify to match your hooks
import { useContactMutation } from "@/hooks/useNotifications";

export default function ContactPanel({ userId, userName, isOwnProfile }) {
  const [message, setMessage] = useState("");
  const [hasSent, setHasSent] = useState(false);

  // Use the mutation hook instead of manual fetch
  const { sendRequest, isPending } = useContactMutation();

  if (isOwnProfile) return null;

  const handleSendRequest = async () => {
    if (!message.trim()) {
      toast.error("Please include a short message.");
      return;
    }

    // This uses the apiClient (Axios) which automatically includes your Auth Token
    sendRequest(userId, message, {
      onSuccess: () => {
        setHasSent(true);
      },
      onError: (err) => {
        // If it's a 400, it might be a "Request already sent" error from your SQL 'ON CONFLICT'
        toast.error(err.response?.data?.message || "Failed to send request");
      },
    });
  };

  if (hasSent) {
    return (
      <Card className="p-6 bg-primary/5 border-primary/20 text-center space-y-3">
        <FaUserCheck className="mx-auto text-3xl text-primary animate-bounce" />
        <h3 className="font-bold">Request Pending</h3>
        <p className="text-xs text-muted-foreground">
          You've sent a contact request to {userName}.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FaEnvelope className="text-primary" />
          <h3 className="font-bold">Interested in connecting?</h3>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Send a professional contact request to {userName}.
        </p>

        <Textarea
          id="contact-message" // Added ID to fix browser warning
          name="message" // Added Name to fix browser warning
          placeholder="Hi! I saw your work on SkillBridge..."
          className="bg-background/50 text-sm h-24 resize-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <Button
          className="w-full gap-2"
          disabled={isPending}
          onClick={handleSendRequest}
        >
          <FaPaperPlane className="w-3 h-3" />
          {isPending ? "Sending..." : "Send Contact Request"}
        </Button>
      </div>
    </Card>
  );
}
