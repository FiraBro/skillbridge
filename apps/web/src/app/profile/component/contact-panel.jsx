import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { FaPaperPlane, FaUserCheck, FaEnvelope } from "react-icons/fa";
import { useToast } from "@/components/ui/use-toast";

export default function ContactPanel({ userId, userName, isOwnProfile }) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [hasSent, setHasSent] = useState(false);
  const { toast } = useToast();

  if (isOwnProfile) return null;

  const handleSendRequest = async () => {
    if (!message.trim()) {
      toast({
        title: "Message required",
        description:
          "Please include a short message with your contact request.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch("/api/notifications/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: userId, message }),
      });

      const data = await res.json();
      if (data.success) {
        setHasSent(true);
        toast({
          title: "Request Sent",
          description: `Your contact request has been sent to ${userName}.`,
        });
      } else {
        toast({
          title: "Failed to send",
          description: data.message || "Something went wrong.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Contact request failed:", error);
    } finally {
      setIsSending(false);
    }
  };

  if (hasSent) {
    return (
      <Card className="p-6 bg-primary/5 border-primary/20 text-center space-y-3">
        <FaUserCheck className="mx-auto text-3xl text-primary animate-bounce" />
        <h3 className="font-bold">Request Pending</h3>
        <p className="text-xs text-muted-foreground">
          You've sent a contact request to {userName}. You'll be notified via
          email if they accept.
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
          Send a professional contact request to {userName}. This will share
          your profile and start a lightweight connection without the hassle of
          a chat system.
        </p>

        <Textarea
          placeholder="Hi! I saw your work on SkillBridge and would love to discuss..."
          className="bg-background/50 text-sm h-24 resize-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <Button
          className="w-full gap-2"
          disabled={isSending}
          onClick={handleSendRequest}
        >
          <FaPaperPlane className="w-3 h-3" />
          {isSending ? "Sending..." : "Send Contact Request"}
        </Button>
      </div>
    </Card>
  );
}
