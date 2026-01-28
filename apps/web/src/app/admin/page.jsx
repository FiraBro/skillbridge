import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ShieldAlert,
  BarChart3,
  Settings2,
  Flag,
  CheckCircle2,
  XCircle,
  Save,
  Users,
  Briefcase,
  FileText,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";

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
        toast({
          title: "Resolution Successful",
          description: `Content has been ${action}ed.`,
        });
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
          title: "Protocol Updated",
          description: "Reputation engine weights synchronized.",
        });
      }
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center animate-pulse font-black italic tracking-tighter text-2xl">
        BOOTING SYSTEM OS...
      </div>
    );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-4xl font-black flex items-center gap-3 italic tracking-tighter">
            <ShieldAlert className="text-primary h-10 w-10" /> PLATFORM
            GOVERNANCE
          </h1>
          <p className="text-muted-foreground font-medium italic">
            SkillBridge Internal Protocol & Content Moderation
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-2xl">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase text-green-600 tracking-widest">
            Systems Nominal
          </span>
        </div>
      </header>

      <div className="flex gap-4 border-b">
        {[
          { id: "overview", icon: BarChart3, label: "Analytics" },
          { id: "moderation", icon: Flag, label: "Audit Queue" },
          { id: "engine", icon: Settings2, label: "Protocol Engine" },
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
            <tab.icon className="h-4 w-4" /> {tab.label}
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
        <AnimatePresence mode="wait">
          {activeTab === "overview" && stats && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    label: "Aggregate Users",
                    val: stats.users,
                    detail: `+${stats.new_users_7d} (7d)`,
                    icon: Users,
                    bg: "bg-blue-500",
                  },
                  {
                    label: "Live Opportunities",
                    val: stats.jobs,
                    detail: "Active Market",
                    icon: Briefcase,
                    bg: "bg-purple-500",
                  },
                  {
                    label: "Community Insights",
                    val: stats.posts,
                    detail: "Total Posts",
                    icon: FileText,
                    bg: "bg-emerald-500",
                  },
                  {
                    label: "Risk Alerts",
                    val: reports.length,
                    detail: "Pending Review",
                    icon: ShieldAlert,
                    bg: "bg-red-500",
                    highlight: reports.length > 0,
                  },
                ].map((stat) => (
                  <Card
                    key={stat.label}
                    className="p-6 overflow-hidden relative group"
                  >
                    <stat.icon
                      className={`absolute -right-4 -bottom-4 h-24 w-24 opacity-5 group-hover:scale-110 transition-transform duration-700 ${stat.bg.replace("bg-", "text-")}`}
                    />
                    <div className="space-y-2 relative z-10">
                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                        {stat.label}
                      </p>
                      <h3
                        className={`text-4xl font-black italic tracking-tighter ${stat.highlight ? "text-red-500" : ""}`}
                      >
                        {stat.val}
                      </h3>
                      <p
                        className={`text-[10px] font-bold ${stat.highlight ? "text-red-400" : "text-primary"}`}
                      >
                        {stat.detail}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <Card className="lg:col-span-8 p-8 space-y-6 rounded-3xl">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-black italic tracking-tight uppercase">
                      System Throughput
                    </h3>
                    <Badge variant="outline" className="text-[10px] font-black">
                      REAL-TIME
                    </Badge>
                  </div>
                  <div className="h-64 flex items-end gap-2 px-4 group">
                    {[40, 70, 45, 90, 65, 80, 55, 95, 40, 60, 85, 50].map(
                      (h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-primary/20 rounded-t-lg relative group/bar hover:bg-primary transition-colors cursor-pointer"
                          style={{ height: `${h}%` }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                            {h}k ops
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium italic">
                    Visualization of daily platform transactions across user
                    identity and payment rails.
                  </p>
                </Card>

                <Card className="lg:col-span-4 p-8 space-y-6 rounded-3xl bg-card">
                  <h3 className="text-lg font-black italic tracking-tight uppercase">
                    Health Diagnostics
                  </h3>
                  <div className="space-y-6">
                    {[
                      { label: "API Latency", val: 98, color: "bg-green-500" },
                      { label: "DB Uptime", val: 99, color: "bg-blue-500" },
                      {
                        label: "Auth Success",
                        val: 92,
                        color: "bg-purple-500",
                      },
                    ].map((h) => (
                      <div key={h.label} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase text-muted-foreground">
                          <span>{h.label}</span>
                          <span>{h.val}%</span>
                        </div>
                        <Progress
                          value={h.val}
                          className="h-1.5"
                          indicatorClassName={h.color}
                        />
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full text-[10px] font-black uppercase tracking-widest h-10 rounded-xl group"
                  >
                    Full Diagnostics{" "}
                    <ArrowUpRight className="ml-2 h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Button>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === "moderation" && (
            <motion.div
              key="moderation"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Attention Required
                </h2>
                <Badge
                  variant="destructive"
                  className="font-black animate-pulse"
                >
                  {reports.length} Alerts
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {reports.map((report) => (
                  <Card
                    key={report.id}
                    className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-red-500/30 transition-colors bg-card/50"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className="capitalize text-[10px] font-black bg-red-500/5 text-red-500 border-red-500/20"
                        >
                          {report.content_type}
                        </Badge>
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter italic">
                          Source: {report.reporter_name}
                        </span>
                      </div>
                      <p className="text-sm font-bold tracking-tight leading-relaxed italic border-l-2 border-red-500/20 pl-4 py-1">
                        "{report.reason}"
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        HASH: {report.content_id.substring(0, 16).toUpperCase()}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="rounded-xl font-black text-[10px] uppercase h-10 px-6 shadow-lg shadow-red-500/10"
                        onClick={() => handleResolveReport(report.id, "delete")}
                      >
                        <XCircle className="mr-2 h-3.5 w-3.5" /> Purge
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-xl font-bold text-[10px] uppercase h-10 px-6 border hover:bg-muted"
                        onClick={() =>
                          handleResolveReport(report.id, "dismiss")
                        }
                      >
                        <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Dismiss
                      </Button>
                    </div>
                  </Card>
                ))}
                {reports.length === 0 && (
                  <div className="py-24 text-center border-2 border-dashed rounded-3xl bg-muted/20">
                    <Activity className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="font-black italic text-xl tracking-tighter opacity-50">
                      PROTOCOL STABLE. NO THREATS DETECTED.
                    </h3>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "engine" && (
            <motion.div
              key="engine"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-3xl mx-auto"
            >
              <Card className="p-10 space-y-10 rounded-3xl shadow-xl border-primary/20 bg-gradient-to-br from-card to-primary/5">
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-black italic tracking-tighter uppercase flex items-center justify-center gap-3">
                    <Settings2 className="text-primary h-6 w-6" />
                    Reputation Protocol Configuration
                  </h2>
                  <p className="text-sm text-muted-foreground font-medium italic">
                    Dynamically balance the platform authority weights. Changes
                    apply in real-time across the data layer.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                  {Object.entries(weights).map(([key, value]) => (
                    <div key={key} className="space-y-3 group">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest group-focus-within:text-primary transition-colors">
                          {key.replace("_", " ")}
                        </label>
                        <span className="text-xs font-mono font-bold text-primary">
                          {value}x
                        </span>
                      </div>
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
                        className="font-mono bg-background h-12 rounded-xl border-none shadow-inner focus-visible:ring-1 focus-visible:ring-primary/50 text-lg font-black"
                      />
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full h-14 gap-3 text-lg font-black italic uppercase rounded-2xl shadow-xl shadow-primary/20 relative overflow-hidden group"
                  onClick={handleSaveWeights}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Save className="h-5 w-5" /> Synchronize System Weights
                  </span>
                  <div className="absolute inset-0 bg-primary-foreground/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
