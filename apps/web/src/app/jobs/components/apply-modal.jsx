import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Send,
  Plus,
  Trash2,
  DollarSign,
  Clock,
  ChevronLeft,
  Calendar,
  FileText,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useJobs } from "@/hooks/useJobs"; // Assuming this handles fetching
import { useAuth } from "@/hooks/useAuth"; // To check user type

export default function ProposalPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // e.g., { role: 'developer' } or { role: 'company' }
  const { data: job, isLoading } = useJobs(jobId);

  const [message, setMessage] = useState("");
  const [duration, setDuration] = useState("less_than_1_month");
  const [milestones, setMilestones] = useState([
    { id: 1, description: "Initial Research & Scoping", amount: "" },
  ]);

  // Real-world check: Only developers can apply
  const isDeveloper = user?.role === "developer";

  const totalBid = useMemo(
    () => milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0),
    [milestones],
  );

  const serviceFee = totalBid * 0.1;
  const takeHome = totalBid - serviceFee;

  const handleMilestoneChange = (id, field, value) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    );
  };

  if (isLoading)
    return <div className="p-20 text-center">Loading Project Details...</div>;

  // REJECTION STATE FOR COMPANIES
  if (!isDeveloper) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border shadow-xl text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center">
            <Lock className="text-amber-600 w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold">Individual Access Only</h2>
          <p className="text-zinc-500">
            Our platform currently limits proposal submissions to verified
            **Independent Developers**. Company profiles are not eligible to bid
            on individual contracts at this time.
          </p>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full rounded-full"
          >
            Return to Feed
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFC] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased pb-20">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Search
          </Button>
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-zinc-400">
              ID: {jobId}
            </span>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">
              <ShieldCheck className="w-3 h-3 mr-1" /> Verified Client
            </Badge>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Form Area */}
          <div className="lg:col-span-8 space-y-8">
            <header>
              <h1 className="text-4xl font-semibold tracking-tight">
                Submit Proposal
              </h1>
              <p className="text-zinc-500 mt-3 text-lg">
                You are applying as an{" "}
                <span className="text-indigo-600 font-medium">
                  Independent Developer
                </span>
                .
              </p>
            </header>

            {/* Terms Section */}
            <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-8 border-b border-zinc-100 dark:border-zinc-800">
                <h2 className="text-xl font-bold">Project Terms</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Define your payment structure and timeline.
                </p>
              </div>

              <div className="p-8 space-y-8">
                <div className="space-y-6">
                  {milestones.map((m, index) => (
                    <div
                      key={m.id}
                      className="group relative flex gap-4 items-end animate-in slide-in-from-top-2"
                    >
                      <div className="flex-1 space-y-2">
                        <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                          Milestone {index + 1}
                        </label>
                        <Input
                          placeholder="What is the deliverable?"
                          value={m.description}
                          onChange={(e) =>
                            handleMilestoneChange(
                              m.id,
                              "description",
                              e.target.value,
                            )
                          }
                          className="h-12 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500"
                        />
                      </div>
                      <div className="w-40 space-y-2">
                        <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                          Amount
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={m.amount}
                            onChange={(e) =>
                              handleMilestoneChange(
                                m.id,
                                "amount",
                                e.target.value,
                              )
                            }
                            className="pl-9 h-12 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl"
                          />
                        </div>
                      </div>
                      {milestones.length > 1 && (
                        <Button
                          variant="ghost"
                          onClick={() =>
                            setMilestones(
                              milestones.filter((item) => item.id !== m.id),
                            )
                          }
                          className="h-12 text-zinc-300 hover:text-red-500"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={() =>
                      setMilestones([
                        ...milestones,
                        { id: Date.now(), description: "", amount: "" },
                      ])
                    }
                    className="w-full border-dashed py-6 rounded-xl text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Project Phase
                  </Button>
                </div>

                {/* Financial Summary */}
                <div className="bg-zinc-900 text-zinc-400 p-8 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span>Total Project Value</span>
                    <span className="text-white font-mono text-lg">
                      ${totalBid.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Service Fee (10%)</span>
                    <span className="text-zinc-500">
                      -${serviceFee.toFixed(2)}
                    </span>
                  </div>
                  <Separator className="bg-zinc-800" />
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">Net Earnings</span>
                    <span className="text-emerald-400 font-bold text-2xl">
                      ${takeHome.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Letter Section */}
            <section className="bg-white dark:bg-zinc-900 border rounded-3xl shadow-sm p-8 space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-bold">Cover Letter</h2>
                <Textarea
                  placeholder="Introduce yourself and explain why you're perfect for this project..."
                  className="min-h-[300px] bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl p-6 text-lg leading-relaxed focus-visible:ring-2 focus-visible:ring-indigo-500"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </section>

            <div className="flex justify-end gap-4">
              <Button
                variant="ghost"
                className="px-8 h-12 text-zinc-500 font-bold"
              >
                Discard
              </Button>
              <Button className="px-12 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-lg transition-transform active:scale-95">
                Submit Proposal <Send className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Sidebar Summary */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white border rounded-3xl p-8 space-y-6 shadow-sm">
                <div className="space-y-2">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                    Active Job
                  </h3>
                  <h2 className="text-xl font-bold leading-tight">
                    {job?.title || "Loading Title..."}
                  </h2>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Posted
                    </span>
                    <span className="text-zinc-900 font-medium">
                      2 hours ago
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" /> Budget
                    </span>
                    <span className="text-zinc-900 font-medium">
                      ${job?.budget_range || "N/A"}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="text-sm font-bold">Skills Required</h4>
                  <div className="flex flex-wrap gap-2">
                    {["React", "Node.js", "AWS"].map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="bg-zinc-100 text-zinc-600 border-none"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-900">
                      Submission Policy
                    </h4>
                    <p className="text-xs text-amber-700 leading-relaxed mt-1">
                      By submitting, you agree to the Terms of Service.
                      Proposals cannot be edited once reviewed by the client.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
