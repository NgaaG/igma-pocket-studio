import { FileText, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FileData {
  id: string;
  name: string;
  thumbnail?: string;
  lastModified: string;
  type: "figma" | "figjam";
  collaborators?: number;
}

interface FileCardProps {
  file: FileData;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function FileCard({ file, onClick, className, style }: FileCardProps) {
  return (
    <button
      onClick={onClick}
      style={style}
      className={cn(
        "w-full text-left bg-card rounded-2xl border border-border/50 overflow-hidden",
        "shadow-soft hover:shadow-elevated transition-all duration-250",
        "active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring",
        "animate-fade-in",
        className
      )}
    >
      {/* Thumbnail */}
      <div className="aspect-[4/3] bg-canvas relative overflow-hidden">
        {file.thumbnail ? (
          <img
            src={file.thumbnail}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Type badge */}
        <div className={cn(
          "absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide",
          file.type === "figma" 
            ? "bg-foreground/90 text-background" 
            : "bg-primary text-primary-foreground"
        )}>
          {file.type === "figma" ? "Figma" : "FigJam"}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-medium text-foreground line-clamp-1 text-[15px]">
          {file.name}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{file.lastModified}</span>
          </div>
          
          {file.collaborators && file.collaborators > 0 && (
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>{file.collaborators}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
