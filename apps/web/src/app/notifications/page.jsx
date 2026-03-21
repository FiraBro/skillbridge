import React from "react";
// Use { } to get the Page, not the Dropdown
import { NotificationPage } from "@/components/NotificationCenter";

const NotificationsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* This will now render the full list version */}
      <NotificationPage />
    </div>
  );
};

export default NotificationsPage;
