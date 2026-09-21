import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "neutral" | "danger";
}

export function StatCard({ label, value, icon: Icon, tone = "neutral" }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            tone === "danger" ? "bg-danger-soft text-danger" : "bg-terracotta-soft text-terracotta"
          }`}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-xs text-charcoal-muted">{label}</p>
          <p className="mt-0.5 font-display text-xl text-charcoal">{value}</p>
        </div>
      </div>
    </Card>
  );
}