import { 
  Hand, 
  MousePointer2, 
  Square, 
  StickyNote, 
  Pencil, 
  Type,
  Minus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

type Tool = "select" | "pan" | "rectangle" | "sticky" | "draw" | "text" | "line";

const tools: { id: Tool; icon: React.ElementType; label: string }[] = [
  { id: "select", icon: MousePointer2, label: "Select" },
  { id: "pan", icon: Hand, label: "Pan" },
  { id: "rectangle", icon: Square, label: "Rectangle" },
  { id: "sticky", icon: StickyNote, label: "Sticky Note" },
  { id: "draw", icon: Pencil, label: "Draw" },
  { id: "text", icon: Type, label: "Text" },
  { id: "line", icon: Minus, label: "Line" },
];

interface CanvasToolbarProps {
  onToolChange?: (tool: Tool) => void;
  visible?: boolean;
}

export function CanvasToolbar({ onToolChange, visible = true }: CanvasToolbarProps) {
  const [activeTool, setActiveTool] = useState<Tool>("select");

  const handleToolSelect = (tool: Tool) => {
    setActiveTool(tool);
    onToolChange?.(tool);
  };

  if (!visible) return null;

  return (
    <div className={cn(
      "fixed left-1/2 -translate-x-1/2 bottom-28 z-40",
      "bg-card/95 backdrop-blur-lg rounded-2xl border border-border/50",
      "shadow-elevated p-2 flex items-center gap-1",
      "animate-scale-in"
    )}>
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;
        
        return (
          <button
            key={tool.id}
            onClick={() => handleToolSelect(tool.id)}
            className={cn(
              "p-3 rounded-xl transition-all duration-200 touch-target",
              "active:scale-95",
              isActive
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
            title={tool.label}
          >
            <Icon className="w-5 h-5" />
          </button>
        );
      })}
    </div>
  );
}
