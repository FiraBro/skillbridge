import { CheckCircle2, Info, Star, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ReputationHistory({ events = [] }) {
  if (!events || events.length === 0) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Info className="text-muted-foreground h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-muted-foreground italic">
          No reputation events recorded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between sticky top-0 bg-card py-2 z-10 border-b">
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
          Audit Timeline
        </h3>
        <Badge variant="secondary" className="text-[10px] font-bold uppercase">
          {events.length} Events
        </Badge>
      </div>

      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/50 before:via-primary/20 before:to-transparent">
        {events.map((event, index) => (
          <div key={index} className="relative flex items-start gap-6 group">
            <div className="absolute left-0 mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-background border-2 border-primary/20 shadow-sm group-hover:border-primary/50 transition-colors z-10">
              {event.change_type === "bonus" ? (
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              ) : event.points > 0 ? (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-red-500" />
              )}
            </div>

            <div className="ml-14 flex-1 pt-1">
              <div className="flex items-center justify-between mb-1">
                <p className="font-bold text-foreground">{event.reason}</p>
                <span className="text-[10px] font-black uppercase text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                  {new Date(event.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-bold ${event.points >= 0 ? "text-primary" : "text-red-500"}`}
                >
                  {event.points >= 0 ? "+" : ""}
                  {event.points} pts
                </span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Verified by System Protocol
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
