"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Croissant, LogOut } from "lucide-react";
import { navItems } from "./nav-items";
import { signOut } from "@/actions/auth";
import { cn } from "@/lib/utils";

interface SidebarProps {
  businessName: string;
  ownerName: string | null;
}

export function Sidebar({ businessName, ownerName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="no-print hidden w-64 shrink-0 flex-col border-r border-border bg-cream-soft md:flex">
      <div className="flex items-center gap-2 px-6 py-6">
        <Croissant className="h-6 w-6 text-terracotta" strokeWidth={1.75} />
        <span className="font-display text-lg text-charcoal">BizFlow</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-terracotta-soft text-terracotta"
                  : "text-charcoal-muted hover:bg-surface hover:text-charcoal",
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-4 py-4">
        <div className="mb-2 px-2">
          <p className="truncate text-sm font-medium text-charcoal">{ownerName ?? "Owner"}</p>
          <p className="truncate text-xs text-charcoal-muted">{businessName}</p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-[var(--radius-control)] px-2 py-2 text-sm font-medium text-charcoal-muted transition-colors hover:bg-surface hover:text-charcoal"
          >
            <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} />
            Log out
          </button>
        </form>
      </div>
    </aside>
  );
}