import { Cloud, CloudOff, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  showSync?: boolean;
  isSynced?: boolean;
  onMenuClick?: () => void;
}

export function Header({ 
  title = "PocketCanvas", 
  showSync = true, 
  isSynced = true,
  onMenuClick 
}: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border safe-top">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 -ml-2 rounded-lg hover:bg-accent transition-colors touch-target"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-foreground tracking-tight">
            {title}
          </h1>
        </div>
        
        {showSync && (
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
            isSynced 
              ? "bg-accent text-primary" 
              : "bg-sync-offline/10 text-sync-offline"
          )}>
            {isSynced ? (
              <>
                <Cloud className="w-4 h-4 animate-gentle-pulse" />
                <span>Synced</span>
              </>
            ) : (
              <>
                <CloudOff className="w-4 h-4" />
                <span>Offline</span>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
