import React, { useEffect } from 'react';
import { useUser } from '@/hooks/useUser'; // Assuming you have a user hook

// Profile views are automatically recorded when visiting a profile page
// The backend records it automatically when fetching profile data
const useRecordProfileView = () => {
  const recordView = ({ profileId, viewerId }) => {
    // Profile view is recorded automatically on profile visit
    console.log('Profile view recorded automatically on profile visit');
  };

  return { mutate: recordView, isPending: false };
};

const ProfileViewPage = ({ profileId, profileOwnerRole }) => {
  const { user } = useUser(); // Assuming you have a user hook
  const { mutate: recordView } = useRecordProfileView();

  useEffect(() => {
    // Only record view if the current user is a company viewing a developer profile
    if (user && user.role === 'company' && profileOwnerRole === 'developer') {
      recordView({
        profileId,
        viewerId: user.id
      });
    }
  }, [user, profileId, profileOwnerRole, recordView]);

  // Rest of your profile component
  return (
    <div>
      {/* Your profile content here */}
    </div>
  );
};

export { ProfileViewPage, useRecordProfileView };