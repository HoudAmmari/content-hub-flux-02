
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/app/AppHeader";
import { AppSidebar } from "@/components/app/AppSidebar";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { CalendarView } from "@/components/calendar/CalendarView";
import { ProjectsView } from "@/components/projects/ProjectsView";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [currentView, setCurrentView] = useState<"dashboard" | "kanban" | "calendar" | "projects">("dashboard");
  const [selectedChannelName, setSelectedChannelName] = useState<string | undefined>(undefined);
  const isMobile = useIsMobile();

  const handleNavigate = (view: string, params?: any) => {
    if (view === "kanban" && params?.channel) {
      setSelectedChannelName(params.channel);
    } else {
      setSelectedChannelName(undefined);
    }
    
    // Here we need to convert the view string to the type accepted by setCurrentView
    if (view === "dashboard" || view === "kanban" || view === "calendar" || view === "projects") {
      setCurrentView(view);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "kanban":
        return <KanbanBoard selectedChannelName={selectedChannelName} />;
      case "calendar":
        return <CalendarView />;
      case "projects":
        return <ProjectsView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar 
          isMobile={isMobile} 
          currentView={currentView} 
          onNavigate={handleNavigate}
        />
        <div className="flex-1 flex flex-col">
          <AppHeader currentView={currentView} />
          <main className="flex-1 p-6 overflow-auto">
            {renderView()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
