import { MobileLayout } from "@/components/layout/MobileLayout";
import { FileCard, FileData } from "@/components/files/FileCard";
import { Folder, Filter, Grid, List, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useFigmaFiles, formatRelativeTime } from "@/hooks/useFigmaFiles";
import { Skeleton } from "@/components/ui/skeleton";

const folders = [
  { id: "f1", name: "Active Projects", count: 12 },
  { id: "f2", name: "Archive", count: 34 },
  { id: "f3", name: "Shared with me", count: 8 },
];

const FilesPage = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<"files" | "folders">("files");
  const { files, isLoading, refetch } = useFigmaFiles();

  // Transform Figma files to FileData format
  const allFiles: FileData[] = files.map((file) => ({
    id: file.key,
    name: file.name,
    thumbnail: file.thumbnail_url || undefined,
    lastModified: formatRelativeTime(file.last_modified),
    type: file.editor_type === "figjam" ? "figjam" : "figma",
  }));

  return (
    <MobileLayout title="Files" showSync={false}>
      <div className="space-y-4 py-4">
        {/* Tabs and view toggle */}
        <div className="px-4 flex items-center justify-between">
          <div className="flex gap-1 bg-secondary rounded-xl p-1">
            <button
              onClick={() => setActiveTab("files")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                activeTab === "files"
                  ? "bg-background text-foreground shadow-soft"
                  : "text-muted-foreground"
              )}
            >
              Files
            </button>
            <button
              onClick={() => setActiveTab("folders")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                activeTab === "folders"
                  ? "bg-background text-foreground shadow-soft"
                  : "text-muted-foreground"
              )}
            >
              Folders
            </button>
          </div>

          <div className="flex gap-1">
            <button 
              onClick={refetch}
              className="p-2.5 rounded-lg hover:bg-accent text-muted-foreground touch-target"
              aria-label="Refresh files"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button className="p-2.5 rounded-lg hover:bg-accent text-muted-foreground touch-target">
              <Filter className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="p-2.5 rounded-lg hover:bg-accent text-muted-foreground touch-target"
            >
              {viewMode === "grid" ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === "files" ? (
          isLoading ? (
            <div className={cn(
              "px-4",
              viewMode === "grid" 
                ? "grid grid-cols-2 gap-3" 
                : "flex flex-col gap-2"
            )}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border/50">
                  <Skeleton className="aspect-[4/3]" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : allFiles.length > 0 ? (
            <div className={cn(
              "px-4",
              viewMode === "grid" 
                ? "grid grid-cols-2 gap-3" 
                : "flex flex-col gap-2"
            )}>
              {allFiles.map((file, index) => (
                <FileCard
                  key={file.id}
                  file={file}
                  onClick={() => navigate(`/canvas?file=${file.id}`)}
                  style={{ animationDelay: `${index * 50}ms` }}
                />
              ))}
            </div>
          ) : (
            <div className="px-4 py-12 text-center">
              <p className="text-muted-foreground">No files found</p>
              <button 
                onClick={refetch}
                className="mt-2 text-primary text-sm font-medium hover:underline"
              >
                Refresh
              </button>
            </div>
          )
        ) : (
          <div className="px-4 space-y-2">
            {folders.map((folder, index) => (
              <button
                key={folder.id}
                className="w-full flex items-center gap-4 p-4 bg-card rounded-xl border border-border/50 shadow-soft hover:shadow-elevated transition-all active:scale-[0.99] animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="p-3 bg-accent rounded-xl">
                  <Folder className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">{folder.name}</p>
                  <p className="text-sm text-muted-foreground">{folder.count} files</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default FilesPage;
