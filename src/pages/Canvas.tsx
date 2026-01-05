import { ArrowLeft, Share2, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CanvasView } from "@/components/canvas/CanvasView";

const CanvasPage = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-canvas">
      {/* Custom header for canvas */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50 safe-top">
        <div className="flex items-center justify-between px-2 py-2">
          <button
            onClick={() => navigate(-1)}
            className="p-3 rounded-xl hover:bg-accent transition-colors touch-target active:scale-95"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          
          <div className="flex-1 px-3 text-center">
            <h1 className="text-sm font-medium text-foreground truncate">
              Brand Guidelines v2
            </h1>
            <p className="text-[11px] text-primary font-medium">Synced</p>
          </div>
          
          <div className="flex items-center gap-1">
            <button className="p-3 rounded-xl hover:bg-accent transition-colors touch-target active:scale-95">
              <Share2 className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="p-3 rounded-xl hover:bg-accent transition-colors touch-target active:scale-95">
              <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* Canvas area */}
      <div className="pt-[60px] pb-[88px] h-full">
        <CanvasView />
      </div>

      {/* Bottom safe area for toolbar */}
      <div className="fixed bottom-0 left-0 right-0 h-[88px] bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
    </div>
  );
};

export default CanvasPage;
