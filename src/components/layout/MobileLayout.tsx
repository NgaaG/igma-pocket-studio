import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { Header } from "./Header";

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
  showNav?: boolean;
  showSync?: boolean;
  isSynced?: boolean;
}

export function MobileLayout({
  children,
  title,
  showHeader = true,
  showNav = true,
  showSync = true,
  isSynced = true,
}: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {showHeader && <Header title={title} showSync={showSync} isSynced={isSynced} />}
      <main className={`
        ${showHeader ? "pt-[72px]" : ""} 
        ${showNav ? "pb-[88px]" : ""} 
        min-h-screen
      `}>
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}
