import apiClient from './api.client';

const NOTIFICATION_API_BASE = '/notifications';

export const notificationService = {
  /**
   * Get all notifications for the authenticated user
   */
  getNotifications: async () => {
    try {
      const response = await apiClient.get(NOTIFICATION_API_BASE);
      // The API returns { success: true, message: "...", data: [...] }
      // The axios interceptor returns response.data, so we get the full object
      if (response.success) {
        return response.data || []; // Return the actual notifications array
      } else {
        throw new Error(response.message || 'Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  /**
   * Get unread notifications count
   */
  getUnreadCount: async () => {
    try {
      const response = await apiClient.get(`${NOTIFICATION_API_BASE}/unread-count`);
      if (response.success) {
        return response.data?.count || 0;
      } else {
        throw new Error(response.message || 'Failed to fetch unread count');
      }
    } catch (error) {
      console.error('Error fetching unread notifications count:', error);
      throw error;
    }
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (notificationId) => {
    try {
      const response = await apiClient.patch(`${NOTIFICATION_API_BASE}/${notificationId}/read`);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || `Failed to mark notification ${notificationId} as read`);
      }
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    try {
      const response = await apiClient.patch(`${NOTIFICATION_API_BASE}/mark-all-read`);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to mark all notifications as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (notificationId) => {
    try {
      const response = await apiClient.delete(`${NOTIFICATION_API_BASE}/${notificationId}`);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || `Failed to delete notification ${notificationId}`);
      }
    } catch (error) {
      console.error(`Error deleting notification ${notificationId}:`, error);
      throw error;
    }
  },

  /**
   * Get profile views for a user
   */
  getProfileViews: async (userId) => {
    try {
      // Using the notifications endpoint to get profile views
      // The backend might not have a dedicated endpoint for this
      // Let's use the getUserNotifications which includes profile views
      const response = await apiClient.get(NOTIFICATION_API_BASE);
      if (response.success) {
        // Filter for profile views only
        return response.data?.filter(notification => notification.type === 'profile_view') || [];
      } else {
        throw new Error(response.message || 'Failed to fetch profile views');
      }
    } catch (error) {
      console.error(`Error fetching profile views for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Record a profile view
   */
  recordProfileView: async ({ profileId, viewerId }) => {
    // Profile views are automatically recorded when visiting a profile page
    // This method is kept for interface consistency but doesn't make an API call
    // since the backend records it automatically when fetching profile data
    console.log('Profile view recorded automatically on profile visit');
    return { success: true, message: 'Profile view recorded' };
  },

  /**
   * Get contact requests for the authenticated user
   */
  getContactRequests: async () => {
    try {
      // Use the notifications endpoint which should include contact requests
      const response = await apiClient.get(NOTIFICATION_API_BASE);
      if (response.success) {
        // Filter for contact requests only
        return response.data?.filter(notification => notification.type === 'contact_request') || [];
      } else {
        throw new Error(response.message || 'Failed to fetch contact requests');
      }
    } catch (error) {
      console.error('Error fetching contact requests:', error);
      throw error;
    }
  },

  /**
   * Send a contact request
   */
  sendContactRequest: async ({ targetUserId, message }) => {
    try {
      const response = await apiClient.post(`${NOTIFICATION_API_BASE}/contact`, {
        receiverId: targetUserId,
        message
      });
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to send contact request');
      }
    } catch (error) {
      console.error('Error sending contact request:', error);
      throw error;
    }
  },

  /**
   * Update contact request status (accept/reject)
   */
  updateContactRequest: async (requestId, status) => {
    try {
      const response = await apiClient.patch(`${NOTIFICATION_API_BASE}/contact/${requestId}`, {
        status
      });
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || `Failed to update contact request ${requestId}`);
      }
    } catch (error) {
      console.error(`Error updating contact request ${requestId}:`, error);
      throw error;
    }
  }
};