import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";

interface AppShellProps {
  businessName: string;
  ownerName: string | null;
  children: React.ReactNode;
}

export function AppShell({ businessName, ownerName, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar businessName={businessName} ownerName={ownerName} />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}