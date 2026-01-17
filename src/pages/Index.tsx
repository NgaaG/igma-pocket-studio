import { Search, Sparkles, RefreshCw } from "lucide-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { QuickAccess } from "@/components/files/QuickAccess";
import { useFigmaFiles, formatRelativeTime } from "@/hooks/useFigmaFiles";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import type { FileData } from "@/components/files/FileCard";

const Index = () => {
  const { profile } = useAuth();
  const { files, isLoading, refetch } = useFigmaFiles();

  // Transform Figma files to FileData format
  const recentFiles: FileData[] = files.slice(0, 6).map((file) => ({
    id: file.key,
    name: file.name,
    thumbnail: file.thumbnail_url || undefined,
    lastModified: formatRelativeTime(file.last_modified),
    type: file.editor_type === "figjam" ? "figjam" : "figma",
  }));

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const firstName = profile?.name?.split(" ")[0] || "";

  return (
    <MobileLayout title="PocketCanvas">
      <div className="space-y-6 py-4">
        {/* Welcome message */}
        <div className="px-4 space-y-2 animate-fade-in">
          <p className="text-muted-foreground text-sm">
            {getGreeting()} {firstName && `${firstName} `}👋
          </p>
          <h2 className="text-2xl font-semibold text-foreground leading-tight">
            Pick up where you left off
          </h2>
        </div>

        {/* Search bar */}
        <div className="px-4 animate-fade-in" style={{ animationDelay: "50ms" }}>
          <button className="w-full flex items-center gap-3 px-4 py-3.5 bg-card rounded-xl border border-border/50 shadow-soft text-left transition-all hover:shadow-elevated active:scale-[0.99]">
            <Search className="w-5 h-5 text-muted-foreground" />
            <span className="text-muted-foreground text-sm">Search your files...</span>
          </button>
        </div>

        {/* AI Suggestion card */}
        {recentFiles.length > 0 && (
          <div className="px-4 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <div className="p-4 bg-accent rounded-2xl border border-primary/20 flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-foreground">Continue your last session</p>
                <p className="text-xs text-muted-foreground">
                  You were working on "{recentFiles[0]?.name}" — {recentFiles[0]?.lastModified}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent files */}
        <div className="animate-fade-in" style={{ animationDelay: "150ms" }}>
          {isLoading ? (
            <div className="px-4 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border/50">
                    <Skeleton className="aspect-[4/3]" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : recentFiles.length > 0 ? (
            <QuickAccess 
              title="Recent Files" 
              files={recentFiles}
              action={
                <button 
                  onClick={refetch}
                  className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
                  aria-label="Refresh files"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              }
            />
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-muted-foreground text-sm">No recent files found</p>
              <button 
                onClick={refetch}
                className="mt-2 text-primary text-sm font-medium hover:underline"
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default Index;
