import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-[var(--radius-control)] bg-border/70", className)}
      {...props}
    />
  );
}

/** A generic skeleton for a list/table of rows, used while data is loading. */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}

/** Shared shape for list pages (Orders, Customers, Products, Invoices): header + filter row + table. */
export function ListPageSkeleton({ filters = 3 }: { filters?: number }) {
  return (
    <div className="px-6 py-8 md:px-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-11 w-36" />
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Skeleton className="h-11 w-full max-w-sm" />
        {Array.from({ length: filters }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full sm:w-44" />
        ))}
      </div>
      <div className="mt-6">
        <TableSkeleton rows={6} />
      </div>
    </div>
  );
}