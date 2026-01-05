import { MobileLayout } from "@/components/layout/MobileLayout";
import { 
  User, 
  Bell, 
  Palette, 
  Cloud, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";

const settingsSections = [
  {
    title: "Account",
    items: [
      { icon: User, label: "Profile", description: "Manage your account details" },
      { icon: Bell, label: "Notifications", description: "Push and sync alerts" },
      { icon: Cloud, label: "Sync Settings", description: "Offline mode preferences" },
    ],
  },
  {
    title: "App",
    items: [
      { icon: Palette, label: "Appearance", description: "Theme and display options" },
      { icon: Download, label: "Install App", description: "Add to home screen" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: HelpCircle, label: "Help & Feedback", description: "Get help or share ideas" },
    ],
  },
];

const SettingsPage = () => {
  return (
    <MobileLayout title="Settings" showSync={false}>
      <div className="space-y-6 py-4">
        {/* Profile card */}
        <div className="px-4 animate-fade-in">
          <div className="p-4 bg-card rounded-2xl border border-border/50 shadow-soft flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-xl font-semibold text-primary">JD</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Jane Designer</p>
              <p className="text-sm text-muted-foreground">jane@design.studio</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        {/* Settings sections */}
        {settingsSections.map((section, sectionIndex) => (
          <div 
            key={section.title} 
            className="space-y-2 animate-fade-in"
            style={{ animationDelay: `${(sectionIndex + 1) * 50}ms` }}
          >
            <h3 className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title}
            </h3>
            <div className="px-4">
              <div className="bg-card rounded-2xl border border-border/50 shadow-soft overflow-hidden divide-y divide-border/50">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      className="w-full flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors active:bg-accent text-left"
                    >
                      <div className="p-2 bg-accent rounded-xl">
                        <Icon className="w-5 h-5 text-accent-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{item.label}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {item.description}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Sign out */}
        <div className="px-4 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <button className="w-full flex items-center justify-center gap-2 p-4 text-destructive font-medium hover:bg-destructive/10 rounded-2xl transition-colors active:scale-[0.99]">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* App version */}
        <div className="px-4 py-8 text-center">
          <p className="text-xs text-muted-foreground">PocketCanvas v1.0.0</p>
        </div>
      </div>
    </MobileLayout>
  );
};

export default SettingsPage;
