import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "BizFlow — Simple bakery management",
  description:
    "BizFlow helps small and home bakeries manage customers, orders, payments and invoices in one place.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-cream text-charcoal">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}