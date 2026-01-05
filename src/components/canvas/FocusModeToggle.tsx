import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface FocusModeToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export function FocusModeToggle({ enabled, onToggle }: FocusModeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "fixed top-20 right-4 z-40 p-3 rounded-full transition-all duration-250",
        "shadow-soft active:scale-95 touch-target",
        enabled
          ? "bg-primary text-primary-foreground"
          : "bg-card text-muted-foreground hover:text-foreground border border-border/50"
      )}
      title={enabled ? "Exit Focus Mode" : "Enter Focus Mode"}
    >
      {enabled ? (
        <Eye className="w-5 h-5" />
      ) : (
        <EyeOff className="w-5 h-5" />
      )}
    </button>
  );
}
