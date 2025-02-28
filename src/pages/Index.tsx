
import { useState } from "react";
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/app/AppHeader";
import { AppSidebar } from "@/components/app/AppSidebar";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { CalendarView } from "@/components/calendar/CalendarView";
import { ProjectsView } from "@/components/projects/ProjectsView";

const Index = () => {
  const [currentView, setCurrentView] = useState<"dashboard" | "kanban" | "calendar" | "projects">("dashboard");

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "kanban":
        return <KanbanBoard />;
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
        <AppSidebar onNavigate={setCurrentView} currentView={currentView} />
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
