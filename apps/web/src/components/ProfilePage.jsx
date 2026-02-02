import React from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Eye,
  UserPlus,
  Check,
  X,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import NotificationPage, { NotificationDropdown } from '@/components/NotificationCenter';
import ContactButton from '@/components/ContactButton';
import SocialProofBadge from '@/components/SocialProofBadge';
import { useNotifications } from '@/hooks/useNotifications';

// Sample profile page component showing integration
const ProfilePage = ({ profileId, profileOwnerRole, userId }) => {
  const { data: notifications = [], isLoading, isError } = useNotifications();

  // Calculate profile views
  const profileViews = notifications.filter(n => n.type === 'profile_view');
  const uniqueViewers = [...new Set(profileViews.map(v => v.actor_name || v.actorName))];
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header with notification dropdown */}
        <div className="flex justify-end mb-6">
          <div className="relative">
            <NotificationDropdown 
              isOpen={false} 
              onClose={() => {}} 
              anchorRef={null} 
            />
          </div>
        </div>
        
        {/* Social Proof Section */}
        <div className="mb-8">
          <SocialProofBadge
            userId={profileId}
          />
        </div>
        
        {/* Profile Content */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold">John Doe</h1>
              <p className="text-muted-foreground">Senior Frontend Developer</p>
              
              <div className="flex items-center gap-2 mt-4">
                <Badge variant="secondary">React</Badge>
                <Badge variant="secondary">TypeScript</Badge>
                <Badge variant="secondary">Node.js</Badge>
              </div>
            </div>
            
            {/* Contact Button */}
            <div>
              <ContactButton 
                targetUserId={profileId} 
                currentStatus="pending" // This would come from your data
              />
            </div>
          </div>
        </div>
        
        {/* Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>

          <div className="space-y-4">
            {notifications.slice(0, 5).map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3 p-3 rounded-lg border"
              >
                <div className="mt-0.5">
                  {notification.type === 'profile_view' ? (
                    <Eye className="h-5 w-5 text-blue-500" />
                  ) : (
                    <UserPlus className="h-5 w-5 text-green-500" />
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-medium">
                    {notification.type === 'profile_view'
                      ? `${notification.actor_name || notification.actorName} viewed your profile`
                      : `${notification.actor_name || notification.actorName} sent a contact request`
                    }
                  </p>

                  {notification.type === 'contact_request' && notification.message && (
                    <p className="text-sm text-muted-foreground mt-1">
                      "{notification.message}"
                    </p>
                  )}

                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.created_at || notification.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {notification.type === 'contact_request' && notification.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-8">
                      <X className="h-4 w-4 mr-1" />
                      Ignore
                    </Button>
                    <Button size="sm" className="h-8">
                      <Check className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;