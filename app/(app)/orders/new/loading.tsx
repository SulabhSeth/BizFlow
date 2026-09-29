import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function NewOrderLoading() {
  return (
    <div className="px-6 py-8 md:px-10">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="mt-3 h-7 w-32" />
      <div className="mt-6 max-w-3xl space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5">
            <Skeleton className="mb-4 h-4 w-24" />
            <Skeleton className="h-24 w-full" />
          </Card>
        ))}
      </div>
    </div>
  );
}