import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Check, Clock, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useContactRequest } from '@/hooks/useNotifications';

const ContactButton = ({ 
  targetUserId, 
  currentStatus = null, 
  onStatusChange,
  disabled = false 
}) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const { sendContactRequest, isPending } = useContactRequest();
  
  const getStatusConfig = (status) => {
    switch (status) {
      case 'accepted':
        return {
          label: 'Connected',
          icon: <Check className="h-4 w-4" />,
          variant: 'default',
          disabled: true,
        };
      case 'pending':
        return {
          label: 'Pending',
          icon: <Clock className="h-4 w-4" />,
          variant: 'secondary',
          disabled: true,
        };
      case 'rejected':
        return {
          label: 'Connect',
          icon: <UserPlus className="h-4 w-4" />,
          variant: 'default',
          disabled: false,
        };
      default:
        return {
          label: 'Connect',
          icon: <UserPlus className="h-4 w-4" />,
          variant: 'default',
          disabled: false,
        };
    }
  };

  const statusConfig = getStatusConfig(currentStatus);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }
    
    sendContactRequest({
      targetUserId: targetUserId, // This will be mapped to receiverId in the service
      message: message.trim(),
    });
    
    setOpen(false);
    setMessage('');
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: statusConfig.disabled ? 1 : 1.02 }}
        whileTap={{ scale: statusConfig.disabled ? 1 : 0.98 }}
      >
        <Button
          variant={statusConfig.variant}
          onClick={() => {
            if (!statusConfig.disabled && !disabled) {
              setOpen(true);
            }
          }}
          disabled={statusConfig.disabled || disabled || isPending}
          className="flex items-center gap-2"
        >
          {statusConfig.icon}
          {isPending ? 'Sending...' : statusConfig.label}
        </Button>
      </motion.div>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Contact Request</DialogTitle>
            <DialogDescription>
              Introduce yourself and let them know why you'd like to connect
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} id="contact-form" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi, I'd like to connect with you..."
                rows={4}
                required
              />
            </div>
          </form>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              form="contact-form"
              disabled={!message.trim()}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContactButton;