import { useState } from "react";
import { CanvasToolbar } from "./CanvasToolbar";
import { FocusModeToggle } from "./FocusModeToggle";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CanvasElement {
  id: string;
  type: "sticky" | "rectangle" | "text";
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  content?: string;
}

const sampleElements: CanvasElement[] = [
  { id: "1", type: "sticky", x: 60, y: 120, width: 140, height: 140, color: "hsl(48, 96%, 89%)", content: "Research insights" },
  { id: "2", type: "sticky", x: 220, y: 100, width: 140, height: 140, color: "hsl(142, 76%, 89%)", content: "User feedback" },
  { id: "3", type: "rectangle", x: 80, y: 300, width: 200, height: 80, color: "hsl(var(--primary) / 0.15)" },
  { id: "4", type: "sticky", x: 180, y: 260, width: 140, height: 140, color: "hsl(221, 91%, 91%)", content: "Next steps" },
];

export function CanvasView() {
  const [focusMode, setFocusMode] = useState(false);
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 25, 200));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 25, 50));
  const handleZoomReset = () => setZoom(100);

  return (
    <div className="relative w-full h-full bg-canvas overflow-hidden">
      {/* Canvas grid background */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border) / 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border) / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Canvas content */}
      <div 
        className="absolute inset-0 transition-transform duration-200"
        style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center center" }}
      >
        {sampleElements.map((element) => (
          <div
            key={element.id}
            className={cn(
              "absolute rounded-lg transition-all duration-200",
              "shadow-soft hover:shadow-elevated cursor-move",
              "active:scale-105"
            )}
            style={{
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              backgroundColor: element.color,
            }}
          >
            {element.type === "sticky" && element.content && (
              <div className="p-3 text-sm font-medium text-foreground/80 h-full flex items-start">
                {element.content}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Focus mode toggle */}
      <FocusModeToggle enabled={focusMode} onToggle={() => setFocusMode(!focusMode)} />

      {/* Zoom controls */}
      <div className={cn(
        "fixed right-4 bottom-28 z-40 flex flex-col gap-2",
        "transition-opacity duration-300",
        focusMode && "opacity-30 hover:opacity-100"
      )}>
        <button
          onClick={handleZoomIn}
          className="p-3 bg-card rounded-xl shadow-soft border border-border/50 text-muted-foreground hover:text-foreground active:scale-95 touch-target"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomReset}
          className="p-3 bg-card rounded-xl shadow-soft border border-border/50 text-muted-foreground hover:text-foreground active:scale-95 touch-target text-xs font-medium"
        >
          {zoom}%
        </button>
        <button
          onClick={handleZoomOut}
          className="p-3 bg-card rounded-xl shadow-soft border border-border/50 text-muted-foreground hover:text-foreground active:scale-95 touch-target"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
      </div>

      {/* Toolbar */}
      <CanvasToolbar visible={!focusMode} />
    </div>
  );
}
