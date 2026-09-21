import { Inbox } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

/** Consistent "nothing here yet" state, per section 28 of the brief. */
export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border border-dashed border-border-strong bg-cream-soft/50 px-6 py-16 text-center">
      <Icon className="h-8 w-8 text-charcoal-muted" strokeWidth={1.5} />
      <div>
        <p className="font-medium text-charcoal">{title}</p>
        <p className="mt-1 text-sm text-charcoal-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}