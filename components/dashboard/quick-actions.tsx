import Link from "next/link";
import { ClipboardList, UserPlus, PackagePlus, FilePlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface QuickAction {
  label: string;
  href: string;
  icon: LucideIcon;
}

const actions: QuickAction[] = [
    { label: "New Order", href: "/orders/new", icon: ClipboardList },
  { label: "Add Customer", href: "/customers?new=1", icon: UserPlus },
  { label: "Add Product", href: "/products?new=1", icon: PackagePlus },
  { label: "Create Invoice", href: "/invoices", icon: FilePlus },
];

export function QuickActions() {
  return (
    <Card className="p-5">
      <p className="mb-3 font-medium text-charcoal">Quick Actions</p>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex flex-col items-center gap-2 rounded-[var(--radius-control)] border border-border px-3 py-4 text-center text-sm font-medium text-charcoal transition-colors hover:border-terracotta/40 hover:bg-terracotta-soft/40"
          >
            <action.icon className="h-5 w-5 text-terracotta" strokeWidth={1.75} />
            {action.label}
          </Link>
        ))}
      </div>
    </Card>
  );
}