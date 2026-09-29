import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function OrderDetailLoading() {
  return (
    <div className="px-6 py-8 md:px-10">
      <Skeleton className="h-4 w-20" />
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      <Card className="mt-6 p-5">
        <Skeleton className="h-8 w-full" />
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5">
            <Skeleton className="mb-3 h-4 w-24" />
            <Skeleton className="h-32 w-full" />
          </Card>
          <Card className="p-5">
            <Skeleton className="mb-3 h-4 w-32" />
            <Skeleton className="h-16 w-full" />
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="p-5">
            <Skeleton className="mb-3 h-4 w-28" />
            <Skeleton className="h-40 w-full" />
          </Card>
          <Card className="p-5">
            <Skeleton className="mb-3 h-4 w-20" />
            <Skeleton className="h-12 w-full" />
          </Card>
        </div>
      </div>
    </div>
  );
}