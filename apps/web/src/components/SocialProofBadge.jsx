import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';

const SocialProofBadge = ({ userId }) => {
  const { data: notifications = [], isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.getNotifications,
    staleTime: 60000, // 1 minute
    cacheTime: 120000, // 2 minutes
  });

  // Filter for profile views only
  const profileViews = notifications.filter(notification => notification.type === 'profile_view');

  if (isLoading || isError || !profileViews || profileViews.length <= 0) {
    return null;
  }

  // Extract unique viewers and their names from the profile view notifications
  const uniqueViewers = [...new Set(profileViews.map(view => view.actor_name || view.actorName))];
  const viewCount = uniqueViewers.length;

  if (viewCount <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            Social Proof
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="font-medium">
              {viewCount} {viewCount === 1 ? 'Company' : 'Companies'} viewed your profile
            </span>
          </div>
          {uniqueViewers.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {uniqueViewers.slice(0, 5).map((company, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {company}
                </Badge>
              ))}
              {uniqueViewers.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{uniqueViewers.length - 5} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SocialProofBadge;