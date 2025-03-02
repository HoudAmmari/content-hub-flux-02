import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";
import Newsletter from "./pages/Newsletter";
import ChannelManager from "./pages/ChannelManager";
import { AppHeader } from "./components/app/AppHeader";
import { AppSidebar } from "./components/app/AppSidebar";
import { SidebarProvider } from "./components/ui/sidebar";
import { useIsMobile } from "./hooks/use-mobile";
import { useState } from "react";
import { ProjectsPage } from "./pages/ProjectsPage";
import { CalendarPage } from "./pages/CalendarPage";
import { KanbanPage } from "./pages/KanbanPage";

const queryClient = new QueryClient();

const App = () => {
  const isMobile = useIsMobile();

  const handleNavigate = (view: string, params?: { channel: string; }) => {
    // if (view === "kanban" && params?.channel) {
    //   setSelectedChannelName(params.channel);
    // } else {
    //   setSelectedChannelName(undefined);
    // }

    // console.log("Navigating to view:", view);

    // // Here we need to convert the view string to the type accepted by setCurrentView
    // if (view === "dashboard" || view === "kanban" || view === "calendar" || view === "projects") {
    //   setCurrentView(view);
    // }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full bg-background">
              <AppSidebar
                isMobile={isMobile}
                onNavigate={handleNavigate}
              />
              <div className="flex-1 flex flex-col">
                <AppHeader />
                <main className="flex-1 p-6 overflow-auto">
                  <Routes>
                    
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/newsletter" element={<Newsletter />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/channels/manage" element={<ChannelManager />} />
                    <Route path="/channels/:channelId" element={<KanbanPage />} />
                    
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
          </SidebarProvider>

        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
