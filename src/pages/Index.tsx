import { Search, Sparkles } from "lucide-react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { QuickAccess } from "@/components/files/QuickAccess";
import type { FileData } from "@/components/files/FileCard";

// Sample data - would come from Figma API
const recentFiles: FileData[] = [
  {
    id: "1",
    name: "Brand Guidelines v2",
    lastModified: "2 hours ago",
    type: "figma",
    collaborators: 3,
  },
  {
    id: "2",
    name: "Sprint Retro Notes",
    lastModified: "Yesterday",
    type: "figjam",
    collaborators: 5,
  },
  {
    id: "3",
    name: "Mobile App Wireframes",
    lastModified: "3 days ago",
    type: "figma",
    collaborators: 2,
  },
  {
    id: "4",
    name: "User Research Synthesis",
    lastModified: "Last week",
    type: "figjam",
    collaborators: 4,
  },
];

const Index = () => {
  return (
    <MobileLayout title="PocketCanvas">
      <div className="space-y-6 py-4">
        {/* Welcome message */}
        <div className="px-4 space-y-2 animate-fade-in">
          <p className="text-muted-foreground text-sm">Good morning 👋</p>
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
        <div className="px-4 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="p-4 bg-accent rounded-2xl border border-primary/20 flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-foreground">Continue your last session</p>
              <p className="text-xs text-muted-foreground">
                You were working on "Brand Guidelines v2" — 3 unsaved annotations
              </p>
            </div>
          </div>
        </div>

        {/* Recent files */}
        <div className="animate-fade-in" style={{ animationDelay: "150ms" }}>
          <QuickAccess title="Recent Files" files={recentFiles} />
        </div>
      </div>
    </MobileLayout>
  );
};

export default Index;
