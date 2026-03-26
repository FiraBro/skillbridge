import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { FaPaperPlane, FaUserCheck, FaEnvelope } from "react-icons/fa";
import { toast } from "react-toastify";
import { useChatMutation } from "@/hooks/useNotifications";

export default function ContactPanel({ userId, userName, isOwnProfile }) {
  const [message, setMessage] = useState("");
  const [hasSent, setHasSent] = useState(false);

  // Using your fixed mutation hook
  const { mutate: sendRequest, isLoading: isPending } = useChatMutation();

  if (isOwnProfile) return null;

  const handleSendRequest = () => {
    if (!message.trim()) {
      toast.error("Please include a short message.");
      return;
    }

    sendRequest(
      { receiverId: userId, message },
      {
        onSuccess: () => {
          setHasSent(true);
          toast.success("Message sent successfully!");
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Failed to send message");
        },
      },
    );
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
          id="contact-message"
          name="message"
          placeholder={`Hi ${userName}, I saw your work on SkillBridge...`}
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
