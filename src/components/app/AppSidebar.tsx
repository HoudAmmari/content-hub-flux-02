
import { 
  LayoutDashboard, 
  Kanban, 
  Calendar, 
  FolderKanban, 
  Settings, 
  PlusCircle,
  Users
} from "lucide-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter,
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarTrigger 
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  onNavigate: (view: "dashboard" | "kanban" | "calendar" | "projects") => void;
  currentView: string;
}

export function AppSidebar({ onNavigate, currentView }: AppSidebarProps) {
  const isMobile = useIsMobile();
  
  const navItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      view: "dashboard"
    },
    {
      title: "Conteúdos",
      icon: Kanban,
      view: "kanban"
    },
    {
      title: "Calendário",
      icon: Calendar,
      view: "calendar"
    },
    {
      title: "Projetos",
      icon: FolderKanban,
      view: "projects"
    }
  ];

  const bottomItems = [
    {
      title: "Configurações",
      icon: Settings,
      view: "settings"
    }
  ];

  return (
    <Sidebar className="border-r border-border bg-muted/40 backdrop-blur-xl">
      <SidebarHeader className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <div className="font-semibold text-lg">ContentHub</div>
        </div>
        {isMobile && <SidebarTrigger />}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    className={cn(
                      currentView === item.view ? "bg-accent text-accent-foreground" : "hover:bg-muted/80"
                    )}
                    onClick={() => onNavigate(item.view as any)}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 py-2">Canais</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-muted-foreground hover:bg-muted/80">
                  <PlusCircle className="w-4 h-4 mr-3" />
                  <span>Novo Canal</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t px-6 py-4">
        <SidebarMenu>
          {bottomItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton className="hover:bg-muted/80">
                <item.icon className="w-5 h-5 mr-3" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
