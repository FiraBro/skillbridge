import { Suspense } from "react";
import NotificationCenter from "./components/notification-center";
import { Card } from "@/components/ui/card";
import { FaUserCircle, FaBriefcase, FaChartLine } from "react-icons/fa";

export default function DashboardPage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-10 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your profile.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Quick Links */}
        <div className="space-y-6">
          <Card className="p-6 bg-primary/5 border-primary/10">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl">
                <FaChartLine />
              </div>
              <div>
                <h3 className="font-bold">Quick Stats</h3>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Profile Views
                </span>
                <span className="font-bold">--</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Contact Requests
                </span>
                <span className="font-bold">--</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Active Jobs
                </span>
                <span className="font-bold">--</span>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-3">
            <Button variant="outline" className="justify-start gap-3 h-12">
              <FaUserCircle className="text-primary" />
              View My Public Profile
            </Button>
            <Button variant="outline" className="justify-start gap-3 h-12">
              <FaBriefcase className="text-primary" />
              Browse Opportunities
            </Button>
          </div>
        </div>

        {/* Right Column: Notification Center */}
        <div className="lg:col-span-2">
          <Suspense
            fallback={
              <div className="h-64 bg-muted animate-pulse rounded-xl" />
            }
          >
            <NotificationCenter />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// Helper Button (assuming it exists in UI components)
import { Button } from "@/components/ui/button";
