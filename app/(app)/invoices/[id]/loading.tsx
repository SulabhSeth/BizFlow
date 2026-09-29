import { Skeleton } from "@/components/ui/skeleton";

export default function InvoiceDetailLoading() {
  return (
    <div className="px-6 py-8 md:px-10">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-36" />
        </div>
      </div>
      <div className="mx-auto mt-6 max-w-3xl rounded-[var(--radius-card)] border border-border bg-surface p-8 shadow-[var(--shadow-card)] sm:p-10">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="space-y-2 sm:text-right">
            <Skeleton className="ml-auto h-5 w-32" />
            <Skeleton className="ml-auto h-4 w-24" />
          </div>
        </div>
        <Skeleton className="mt-8 h-24 w-full" />
        <Skeleton className="mt-8 h-40 w-full" />
        <Skeleton className="mt-6 ml-auto h-32 w-full max-w-xs" />
      </div>
    </div>
  );
}