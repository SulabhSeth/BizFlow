import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "neutral" | "danger";
  href?: string;
}

export function StatCard({ label, value, icon: Icon, tone = "neutral", href }: StatCardProps) {
  const content = (
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
  );

  if (href) {
    return (
      <Link href={href}>
        <Card className="p-5 transition-colors hover:border-terracotta/40 hover:bg-terracotta-soft/20">
          {content}
        </Card>
      </Link>
    );
  }

  return <Card className="p-5">{content}</Card>;
}