import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Send,
  Plus,
  Trash2,
  DollarSign,
  ChevronLeft,
  Lock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useJobs, useApplyJob } from "@/hooks/useJobs"; // Import the hook
import { useAuth } from "@/hooks/useAuth";

export default function ProposalPage() {
  const { id: jobId } = useParams(); // Ensure your route is /jobs/:jobId
  console.log("Debug: Retrieved jobId from URL params:", jobId);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: job, isLoading } = useJobs(jobId);

  // 1. Initialize the Mutation Hook
  const { mutate: applyJob, isPending: isSubmitting } = useApplyJob();

  const [message, setMessage] = useState("");
  const [milestones, setMilestones] = useState([
    { id: 1, description: "", amount: "" },
  ]);
  const [error, setError] = useState(null);

  const isDeveloper = user?.role === "developer";

  const totalBid = useMemo(
    () => milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0),
    [milestones],
  );

  const handleApply = () => {
    // 2. Client-side validation before sending
    if (!jobId || jobId === "undefined") {
      console.log("Debug: Invalid jobId detected:", jobId);
      setError(
        "Job ID is missing. Please return to the job list and try again.",
      );
      return;
    }

    if (message.trim().length < 20) {
      setError("Please provide a cover letter with at least 20 characters.");
      return;
    }

    setError(null);

    // 3. Prepare structured payload for the Backend
    const payload = {
      message: message.trim(),
      milestones: milestones.map((m) => ({
        description: m.description,
        amount: parseFloat(m.amount) || 0,
      })),
    };

    // 4. Use the mutation hook (This fixes the UUID undefined error)
    applyJob(
      { id: jobId, data: payload },
      {
        onSuccess: () => {
          navigate("/dashboard/applications", { state: { success: true } });
        },
        onError: (err) => {
          const errMsg = err.response?.data?.message || "Something went wrong";
          setError(errMsg);
        },
      },
    );
  };

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );

  if (!isDeveloper) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBFBFC] px-4">
        <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] border shadow-2xl text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center">
            <Lock className="text-amber-600 w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">
            Individual Access Only
          </h2>
          <p className="text-zinc-500 leading-relaxed">
            Company profiles are not eligible to bid on individual contracts.
            Please use a <b>Developer Account</b> to submit proposals.
          </p>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full rounded-2xl h-12"
          >
            Return to Feed
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFC] pb-20 font-sans">
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-zinc-100">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="rounded-full hover:bg-zinc-100"
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> Project Details
          </Button>
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 px-4 py-1.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Verified Client
          </Badge>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-12">
        <div className="space-y-10">
          <header>
            <h1 className="text-5xl font-bold tracking-tight text-zinc-900">
              Submit Proposal
            </h1>
            <p className="text-zinc-500 mt-4 text-xl">
              Set your terms for{" "}
              <span className="text-indigo-600 font-semibold">
                {job?.title || "this project"}
              </span>
            </p>
          </header>

          {error && (
            <Alert
              variant="destructive"
              className="rounded-2xl bg-red-50 border-red-100 text-red-800 animate-in fade-in zoom-in duration-200"
            >
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="font-medium ml-2">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-800">Cover Letter</h3>
              <span className="text-xs font-medium text-zinc-400">
                {message.length} / 2000
              </span>
            </div>
            <Textarea
              placeholder="Explain why you're the perfect fit for this role..."
              className="min-h-[250px] rounded-[2rem] p-8 bg-white border-zinc-200 focus:ring-4 focus:ring-indigo-500/10 transition-all text-lg shadow-sm"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </section>

          <section className="bg-white border border-zinc-200 rounded-[2.5rem] p-10 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-zinc-800">
                Milestones & Pricing
              </h3>
              <Badge
                variant="outline"
                className="rounded-full px-4 py-1 text-indigo-600 border-indigo-100 bg-indigo-50/50"
              >
                Total Bid: ${totalBid.toLocaleString()}
              </Badge>
            </div>

            <div className="space-y-6">
              {milestones.map((m, index) => (
                <div
                  key={m.id}
                  className="flex gap-4 items-center group animate-in slide-in-from-top-2"
                >
                  <div className="flex-1 bg-zinc-50 border border-zinc-100 rounded-2xl px-4 py-1 focus-within:bg-white focus-within:border-indigo-200 transition-all">
                    <Input
                      variant="ghost"
                      placeholder={`Milestone ${index + 1}: e.g. Frontend Development`}
                      className="border-none focus-visible:ring-0 text-zinc-700 font-medium h-12"
                      value={m.description}
                      onChange={(e) =>
                        setMilestones((prev) =>
                          prev.map((item) =>
                            item.id === m.id
                              ? { ...item, description: e.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </div>
                  <div className="w-36 bg-zinc-50 border border-zinc-100 rounded-2xl px-4 py-1 relative focus-within:bg-white focus-within:border-indigo-200 transition-all">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                      type="number"
                      variant="ghost"
                      placeholder="0.00"
                      className="border-none focus-visible:ring-0 pl-6 h-12 font-bold text-zinc-800"
                      value={m.amount}
                      onChange={(e) =>
                        setMilestones((prev) =>
                          prev.map((item) =>
                            item.id === m.id
                              ? { ...item, amount: e.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </div>
                  {milestones.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setMilestones((prev) =>
                          prev.filter((item) => item.id !== m.id),
                        )
                      }
                      className="rounded-full hover:bg-red-50 hover:text-red-500 text-zinc-300 transition-colors"
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
                className="w-full border-dashed border-2 py-8 rounded-2xl text-indigo-600 hover:bg-indigo-50/50 hover:border-indigo-200 transition-all"
              >
                <Plus className="w-5 h-5 mr-2" /> Add Milestone
              </Button>
            </div>

            <div className="mt-12 pt-10 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                  Estimated Take Home
                </p>
                <p className="text-4xl font-black text-zinc-900 mt-1">
                  ${(totalBid * 0.9).toLocaleString()}
                </p>
                <p className="text-xs text-zinc-400 mt-1 italic">
                  Includes 10% platform service fee
                </p>
              </div>

              <Button
                onClick={handleApply}
                disabled={isSubmitting || !message.trim() || totalBid <= 0}
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-16 h-16 rounded-[1.25rem] text-xl font-bold shadow-2xl shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-3" /> Submit Proposal
                  </>
                )}
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
