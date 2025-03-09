
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
import { ProjectsPage } from "./pages/ProjectsPage";
import { CalendarPage } from "./pages/CalendarPage";
import { KanbanPage } from "./pages/KanbanPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";

const queryClient = new QueryClient();

const App = () => {
  const isMobile = useIsMobile();

  const handleNavigate = (view: string, params?: { channel: string }) => {
    // sua lógica de navegação, se necessário
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="h-screen flex flex-row bg-background w-full overflow-hidden">
              <div className="w-64">
                <AppSidebar isMobile={isMobile} onNavigate={handleNavigate} />
              </div>

              <div className="flex-1 flex flex-col overflow-hidden">
                <AppHeader />

                <main className="flex-1 p-6 overflow-scroll flex-1">
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
                    <Route path="/newsletter" element={<Newsletter />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/channels/manage" element={<ChannelManager />} />
                    <Route path="/channels/:channelId" element={<KanbanPage />} />

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
