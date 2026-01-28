import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FaUserShield, FaPaperPlane } from "react-icons/fa";

export default function ApplyModal({ job, isOpen, onClose, onConfirm }) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!job) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onConfirm(job.id, message);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Apply to {job.title}
          </DialogTitle>
          <DialogDescription>
            You are applying with your <strong>SkillBridge Profile</strong>.
            Your verified skills, reputation, and project history will be
            visible to the client.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 flex gap-3 items-start">
            <FaUserShield className="text-primary mt-1 shrink-0" />
            <div className="text-xs text-muted-foreground leading-relaxed">
              Applying with your profile removes the need for CV uploads. Your
              <strong> {job.matchPercentage}% match score</strong> and
              <strong> peer endorsements</strong> will be highlighted to the
              client automatically.
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Message to Client (Optional)
            </label>
            <Textarea
              placeholder="Tell the client why you're a great fit for this specific opportunity..."
              className="resize-none h-32"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="gap-2"
          >
            <FaPaperPlane className="w-3 h-3" />
            {isSubmitting ? "Sending..." : "Submit Application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper to handle the state in the parent
import { useState } from "react";
