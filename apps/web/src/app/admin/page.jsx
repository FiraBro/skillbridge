import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FaShieldAlt,
  FaChartLine,
  FaCog,
  FaFlag,
  FaCheck,
  FaTimes,
  FaSave,
} from "react-icons/fa";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [weights, setWeights] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, reportsRes, weightsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/reports?status=pending"),
        fetch("/api/admin/settings/reputation_weights"),
      ]);

      const statsData = await statsRes.json();
      const reportsData = await reportsRes.json();
      const weightsData = await weightsRes.json();

      if (statsData.success) setStats(statsData.data);
      if (reportsData.success) setReports(reportsData.data);
      if (weightsData.success) setWeights(weightsData.data);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async (reportId, action) => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes: "Resolved via Admin Dashboard" }),
      });
      if (res.ok) {
        setReports(reports.filter((r) => r.id !== reportId));
        toast({ title: "Success", description: `Report ${action}ed.` });
      }
    } catch (error) {
      console.error("Resolve failed:", error);
    }
  };

  const handleSaveWeights = async () => {
    try {
      const res = await fetch("/api/admin/settings/reputation_weights", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(weights),
      });
      if (res.ok) {
        toast({
          title: "Weights Updated",
          description: "Reputation engine fine-tuned successfully.",
        });
      }
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center animate-pulse">
        Loading Admin Suite...
      </div>
    );

  return (
    <div className="container max-w-7xl mx-auto px-4 py-10 space-y-10">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-2 italic">
            <FaShieldAlt className="text-primary" /> PLATFORM CONTROL
          </h1>
          <p className="text-muted-foreground">
            SkillBridge Internal Governance & Moderation
          </p>
        </div>
      </header>

      <div className="flex gap-4 border-b">
        {[
          { id: "overview", icon: FaChartLine, label: "Overview" },
          { id: "moderation", icon: FaFlag, label: "Moderation Queue" },
          { id: "engine", icon: FaCog, label: "Reputation Engine" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 px-6 text-sm font-bold flex items-center gap-2 transition-all relative ${
              activeTab === tab.id
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon /> {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="admin-tab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-primary"
              />
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-primary/5 border-primary/10">
              <p className="text-xs font-bold uppercase text-muted-foreground">
                Total Users
              </p>
              <h3 className="text-4xl font-black mt-1">{stats.users}</h3>
              <p className="text-xs text-primary mt-2 flex items-center gap-1 font-medium">
                +{stats.new_users_7d} in last 7 days
              </p>
            </Card>
            <Card className="p-6">
              <p className="text-xs font-bold uppercase text-muted-foreground">
                Active Jobs
              </p>
              <h3 className="text-4xl font-black mt-1">{stats.jobs}</h3>
            </Card>
            <Card className="p-6">
              <p className="text-xs font-bold uppercase text-muted-foreground">
                Total Posts
              </p>
              <h3 className="text-4xl font-black mt-1">{stats.posts}</h3>
            </Card>
            <Card className="p-6 bg-red-500/5 border-red-500/10">
              <p className="text-xs font-bold uppercase text-muted-foreground">
                Pending Reports
              </p>
              <h3 className="text-4xl font-black mt-1 text-red-500">
                {reports.length}
              </h3>
            </Card>
          </div>
        )}

        {/* MODERATION TAB */}
        {activeTab === "moderation" && (
          <Card className="overflow-hidden">
            <div className="p-6 border-b bg-muted/30">
              <h2 className="font-bold flex items-center gap-2">
                <FaFlag /> Pending Action Items
              </h2>
            </div>
            <div className="divide-y">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-6 flex justify-between items-center hover:bg-muted/10 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {report.content_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        From: {report.reporter_name}
                      </span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed">
                      Reason: "{report.reason}"
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">
                      Content ID: {report.content_id}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 gap-1"
                      onClick={() => handleResolveReport(report.id, "delete")}
                    >
                      <FaTimes /> Delete Content
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleResolveReport(report.id, "dismiss")}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              ))}
              {reports.length === 0 && (
                <div className="py-20 text-center text-muted-foreground">
                  <h3 className="font-bold italic text-lg">
                    Platform is clean. No pending reports.
                  </h3>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* ENGINE SETTINGS TAB */}
        {activeTab === "engine" && (
          <div className="max-w-2xl">
            <Card className="p-8 space-y-8">
              <div className="space-y-2">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FaCog /> Dynamic Weights
                </h2>
                <p className="text-sm text-muted-foreground italic">
                  Adjust how reputation is calculated system-wide without code
                  changes.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                {Object.entries(weights).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">
                      {key.replace("_", " ")}
                    </label>
                    <Input
                      type="number"
                      step="0.1"
                      value={value}
                      onChange={(e) =>
                        setWeights({
                          ...weights,
                          [key]: parseFloat(e.target.value),
                        })
                      }
                      className="font-mono bg-background/50 h-10"
                    />
                  </div>
                ))}
              </div>

              <Button
                className="w-full h-12 gap-2 text-lg font-black"
                onClick={handleSaveWeights}
              >
                <FaSave /> APPLY SYSTEM CHANGES
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
