import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function SettingsLoading() {
  return (
    <div className="px-6 py-8 md:px-10">
      <Skeleton className="h-7 w-32" />
      <Skeleton className="mt-2 h-4 w-64" />
      <div className="mt-6 max-w-3xl space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-5">
            <Skeleton className="mb-4 h-4 w-24" />
            <Skeleton className="h-28 w-full" />
          </Card>
        ))}
      </div>
    </div>
  );
}