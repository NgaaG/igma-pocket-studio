import { ChevronRight } from "lucide-react";
import { FileCard, FileData } from "./FileCard";
import { useNavigate } from "react-router-dom";
import { ReactNode } from "react";

interface QuickAccessProps {
  title: string;
  files: FileData[];
  showAll?: boolean;
  action?: ReactNode;
}

export function QuickAccess({ title, files, showAll = true, action }: QuickAccessProps) {
  const navigate = useNavigate();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-4">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <div className="flex items-center gap-2">
          {action}
          {showAll && (
            <button 
              onClick={() => navigate("/files")}
              className="flex items-center gap-1 text-sm text-primary font-medium hover:underline touch-target"
            >
              See all
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      
      <div className="px-4 grid grid-cols-2 gap-3">
        {files.map((file, index) => (
          <FileCard
            key={file.id}
            file={file}
            onClick={() => navigate(`/canvas?file=${file.id}`)}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
          />
        ))}
      </div>
    </section>
  );
}
