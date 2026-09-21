"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal, X, LogOut } from "lucide-react";
import { mobilePrimaryItems, mobileMoreItems } from "./nav-items";
import { signOut } from "@/actions/auth";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = mobileMoreItems.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/"),
  );

  return (
    <>
      {moreOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-charcoal/30" />
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-[var(--radius-card)] border-t border-border bg-surface p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-[var(--shadow-card)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-charcoal">More</p>
              <button
                onClick={() => setMoreOpen(false)}
                aria-label="Close"
                className="text-charcoal-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-1">
              {mobileMoreItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-sm font-medium text-charcoal hover:bg-cream-soft"
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                    {item.label}
                  </Link>
                );
              })}
              <form action={signOut}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-sm font-medium text-danger hover:bg-danger-soft"
                >
                  <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} />
                  Log out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
        {mobilePrimaryItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium",
                isActive ? "text-terracotta" : "text-charcoal-muted",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={() => setMoreOpen(true)}
          className={cn(
            "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium",
            isMoreActive ? "text-terracotta" : "text-charcoal-muted",
          )}
        >
          <MoreHorizontal className="h-5 w-5" strokeWidth={1.75} />
          More
        </button>
      </nav>
    </>
  );
}