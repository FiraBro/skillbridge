import { motion } from "framer-motion";
import {
  Briefcase,
  Users,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Activity,
  AlertTriangle,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/* =====================================================
   ANIMATION SYSTEM (Linear.app style)
===================================================== */

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.35,
      ease: "easeOut",
    },
  }),
};

/* =====================================================
   DATA (Replace later with API)
===================================================== */

const stats = [
  {
    title: "Active Jobs",
    value: "12",
    change: "+18%",
    icon: Briefcase,
  },
  {
    title: "Applicants",
    value: "148",
    change: "+24%",
    icon: Users,
  },
  {
    title: "Hire Rate",
    value: "18%",
    change: "+5%",
    icon: TrendingUp,
  },
];

const activities = [
  "Ahmed applied to Frontend Developer",
  "New job posted: Backend Engineer",
  "Sara accepted offer",
  "5 applicants waiting review",
];

/* =====================================================
   STAT CARD (FAANG STYLE)
===================================================== */

const StatCard = ({ stat, index }) => {
  const Icon = stat.icon;

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      custom={index}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className="p-6 rounded-2xl border bg-white/60 dark:bg-zinc-900/60 backdrop-blur transition-all duration-300 hover:shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">{stat.title}</p>

            <h2 className="text-3xl font-semibold mt-2 tracking-tight">
              {stat.value}
            </h2>

            <div className="flex items-center gap-1 mt-2 text-emerald-500 text-xs font-medium">
              <ArrowUpRight size={14} />
              {stat.change}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-muted group-hover:scale-110 transition">
            <Icon size={20} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

/* =====================================================
   ACTION CENTER
===================================================== */

const ActionCenter = () => (
  <Card className="p-6 rounded-2xl h-full">
    <div className="flex items-center gap-2 mb-5">
      <AlertTriangle className="text-yellow-500" size={18} />
      <h3 className="font-semibold">Needs Attention</h3>
    </div>

    <div className="space-y-3 text-sm">
      <ActionItem text="2 jobs have no applicants" />
      <ActionItem text="5 applicants waiting review" />
      <ActionItem text="High activity detected today" />
    </div>
  </Card>
);

const ActionItem = ({ text }) => (
  <div className="flex justify-between items-center p-3 rounded-lg hover:bg-muted transition cursor-pointer">
    <span>{text}</span>
    <ArrowUpRight size={14} className="opacity-40" />
  </div>
);

/* =====================================================
   ANALYTICS PREVIEW
===================================================== */

const AnalyticsPreview = () => (
  <Card className="p-6 rounded-2xl">
    <h3 className="font-semibold mb-4">Applications Overview</h3>

    <div className="h-44 rounded-xl bg-gradient-to-br from-muted to-transparent flex items-center justify-center text-muted-foreground text-sm">
      📊 Chart Area (Add Recharts Later)
    </div>
  </Card>
);

/* =====================================================
   ACTIVITY FEED
===================================================== */

const ActivityFeed = () => (
  <Card className="p-6 rounded-2xl">
    <div className="flex items-center gap-2 mb-4">
      <Activity size={18} />
      <h3 className="font-semibold">Recent Activity</h3>
    </div>

    <div className="space-y-3">
      {activities.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="text-sm text-muted-foreground border-b pb-2 last:border-none"
        >
          {item}
        </motion.div>
      ))}
    </div>
  </Card>
);

/* =====================================================
   MAIN DASHBOARD
===================================================== */

export default function Dashboard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 p-6"
    >
      {/* HEADER */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="flex flex-col md:flex-row md:justify-between md:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back 👋
          </h1>
          <p className="text-muted-foreground text-sm">
            Here’s your platform overview today.
          </p>
        </div>

        <Button className="gap-2">
          <Plus size={16} />
          Post Job
        </Button>
      </motion.div>

      {/* STATS */}
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((s, i) => (
          <StatCard key={i} stat={s} index={i} />
        ))}
      </div>

      {/* ACTION + ANALYTICS */}
      <div className="grid lg:grid-cols-3 gap-6">
        <ActionCenter />
        <div className="lg:col-span-2">
          <AnalyticsPreview />
        </div>
      </div>

      {/* ACTIVITY */}
      <ActivityFeed />

      {/* TABLE */}
      <Card className="p-6 rounded-2xl">
        <h3 className="font-semibold mb-4">Your Job Listings</h3>

        <div className="text-sm text-muted-foreground">
          Data table goes here...
        </div>
      </Card>
    </motion.div>
  );
}
