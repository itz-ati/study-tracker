import type { ReactNode } from "react";
import Navbar from "@/components/dashboard/navbar";
import PremiumPrompt from "@/components/marketing/PremiumPrompt";
import HelpWidget from "@/components/help/HelpWidget";

export default function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <PremiumPrompt />
      {children}
      <HelpWidget />
    </div>
  );
}